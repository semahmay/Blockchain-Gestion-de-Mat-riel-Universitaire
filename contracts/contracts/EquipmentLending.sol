// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title EquipmentLending
/// @notice On-chain rules for requesting, approving, rejecting, cancelling and returning
///         university equipment loans.
/// @dev Only wallet addresses, equipment metadata, quantities and loan states are stored.
///      Student names, emails, student IDs and free-text purposes must remain off-chain.
contract EquipmentLending is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum LoanState {
        None,
        Pending,
        Approved,
        Rejected,
        Returned,
        Cancelled
    }

    struct Equipment {
        string assetReference;
        string name;
        uint256 totalUnits;
        uint256 availableUnits;
        bool active;
        uint64 registeredAt;
    }

    struct Loan {
        bytes32 equipmentId;
        address borrower;
        uint256 quantity;
        uint64 requestedAt;
        uint64 decidedAt;
        uint64 cancelledAt;
        uint64 returnedAt;
        LoanState state;
        /// @dev Opaque code chosen by the administrator. Free-text reasons stay off-chain.
        bytes32 rejectionReason;
    }

    mapping(bytes32 => Equipment) private _equipment;
    mapping(bytes32 => Loan) private _loans;

    uint256 public equipmentCount;
    uint256 public loanCount;

    event EquipmentRegistered(
        bytes32 indexed equipmentId,
        string assetReference,
        string name,
        uint256 totalUnits
    );
    event EquipmentAvailabilityChanged(bytes32 indexed equipmentId, bool active);
    event LoanRequested(
        bytes32 indexed loanId,
        bytes32 indexed equipmentId,
        address indexed borrower,
        uint256 quantity,
        uint64 requestedAt
    );
    event LoanApproved(
        bytes32 indexed loanId,
        bytes32 indexed equipmentId,
        address indexed borrower,
        uint256 quantity,
        uint64 decidedAt
    );
    event LoanRejected(
        bytes32 indexed loanId,
        bytes32 indexed equipmentId,
        address indexed borrower,
        bytes32 reasonCode,
        uint64 decidedAt
    );
    event LoanCancelled(
        bytes32 indexed loanId,
        bytes32 indexed equipmentId,
        address indexed borrower,
        uint64 cancelledAt
    );
    event LoanReturned(
        bytes32 indexed loanId,
        bytes32 indexed equipmentId,
        address indexed borrower,
        uint256 quantity,
        uint64 returnedAt
    );

    error InvalidEquipmentId();
    error EmptyEquipmentMetadata();
    error EquipmentAlreadyRegistered(bytes32 equipmentId);
    error EquipmentNotFound(bytes32 equipmentId);
    error EquipmentInactive(bytes32 equipmentId);
    error InvalidLoanId();
    error InvalidQuantity();
    error LoanAlreadyExists(bytes32 loanId);
    error LoanNotFound(bytes32 loanId);
    error InsufficientStock(bytes32 equipmentId, uint256 requested, uint256 available);
    error UnauthorizedBorrower(bytes32 loanId, address caller);
    error InvalidLoanState(bytes32 loanId, LoanState currentState, LoanState requiredState);
    error StockInvariantViolation(bytes32 equipmentId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /// @notice Registers a new equipment reference with its initial stock.
    /// @dev The administrator must manage physical inventory and call this once per equipment ID.
    function registerEquipment(
        bytes32 equipmentId,
        string calldata assetReference,
        string calldata name,
        uint256 totalUnits
    ) external onlyRole(ADMIN_ROLE) {
        if (equipmentId == bytes32(0)) revert InvalidEquipmentId();
        if (totalUnits == 0) revert InvalidQuantity();
        if (bytes(assetReference).length == 0 || bytes(name).length == 0) {
            revert EmptyEquipmentMetadata();
        }
        if (_equipment[equipmentId].totalUnits != 0) {
            revert EquipmentAlreadyRegistered(equipmentId);
        }

        _equipment[equipmentId] = Equipment({
            assetReference: assetReference,
            name: name,
            totalUnits: totalUnits,
            availableUnits: totalUnits,
            active: true,
            registeredAt: uint64(block.timestamp)
        });
        equipmentCount += 1;

        emit EquipmentRegistered(equipmentId, assetReference, name, totalUnits);
    }

    /// @notice Marks equipment as available or temporarily unavailable (for example, maintenance).
    /// @dev Existing approved loans can still be returned while equipment is inactive.
    function setEquipmentActive(bytes32 equipmentId, bool active)
        external
        onlyRole(ADMIN_ROLE)
    {
        Equipment storage item = _requireEquipment(equipmentId);
        item.active = active;

        emit EquipmentAvailabilityChanged(equipmentId, active);
    }

    /// @notice Creates a pending loan request. Pending requests do not reserve stock.
    /// @dev Stock is reserved only when an administrator approves the request.
    function requestLoan(bytes32 loanId, bytes32 equipmentId, uint256 quantity) external {
        if (loanId == bytes32(0)) revert InvalidLoanId();
        if (quantity == 0) revert InvalidQuantity();

        Equipment storage item = _requireEquipment(equipmentId);
        if (!item.active) revert EquipmentInactive(equipmentId);
        if (_loans[loanId].state != LoanState.None) revert LoanAlreadyExists(loanId);
        if (quantity > item.availableUnits) {
            revert InsufficientStock(equipmentId, quantity, item.availableUnits);
        }

        uint64 requestedAt = uint64(block.timestamp);
        _loans[loanId] = Loan({
            equipmentId: equipmentId,
            borrower: msg.sender,
            quantity: quantity,
            requestedAt: requestedAt,
            decidedAt: 0,
            cancelledAt: 0,
            returnedAt: 0,
            state: LoanState.Pending,
            rejectionReason: bytes32(0)
        });
        loanCount += 1;

        emit LoanRequested(loanId, equipmentId, msg.sender, quantity, requestedAt);
    }

    /// @notice Approves a pending request and reserves the requested stock.
    function approveLoan(bytes32 loanId) external onlyRole(ADMIN_ROLE) {
        Loan storage loan = _requireLoan(loanId);
        _requireState(loanId, loan, LoanState.Pending);

        Equipment storage item = _requireEquipment(loan.equipmentId);
        if (!item.active) revert EquipmentInactive(loan.equipmentId);
        if (loan.quantity > item.availableUnits) {
            revert InsufficientStock(loan.equipmentId, loan.quantity, item.availableUnits);
        }

        item.availableUnits -= loan.quantity;
        loan.state = LoanState.Approved;
        loan.decidedAt = uint64(block.timestamp);

        emit LoanApproved(
            loanId,
            loan.equipmentId,
            loan.borrower,
            loan.quantity,
            loan.decidedAt
        );
    }

    /// @notice Rejects a pending request without changing stock.
    /// @param reasonCode Opaque administrator code; do not put personal data on-chain.
    function rejectLoan(bytes32 loanId, bytes32 reasonCode) external onlyRole(ADMIN_ROLE) {
        Loan storage loan = _requireLoan(loanId);
        _requireState(loanId, loan, LoanState.Pending);

        loan.state = LoanState.Rejected;
        loan.decidedAt = uint64(block.timestamp);
        loan.rejectionReason = reasonCode;

        emit LoanRejected(
            loanId,
            loan.equipmentId,
            loan.borrower,
            reasonCode,
            loan.decidedAt
        );
    }

    /// @notice Cancels a pending request. Only the borrower may cancel.
    function cancelLoan(bytes32 loanId) external {
        Loan storage loan = _requireLoan(loanId);
        if (loan.borrower != msg.sender) {
            revert UnauthorizedBorrower(loanId, msg.sender);
        }
        _requireState(loanId, loan, LoanState.Pending);

        loan.state = LoanState.Cancelled;
        loan.cancelledAt = uint64(block.timestamp);

        emit LoanCancelled(loanId, loan.equipmentId, loan.borrower, loan.cancelledAt);
    }

    /// @notice Records the physical return of an approved loan and restores stock.
    /// @dev Staff confirms returns so borrowers cannot clear an active loan by themselves.
    function recordReturn(bytes32 loanId) external onlyRole(ADMIN_ROLE) {
        Loan storage loan = _requireLoan(loanId);
        _requireState(loanId, loan, LoanState.Approved);

        Equipment storage item = _requireEquipment(loan.equipmentId);
        if (item.availableUnits + loan.quantity > item.totalUnits) {
            revert StockInvariantViolation(loan.equipmentId);
        }

        item.availableUnits += loan.quantity;
        loan.state = LoanState.Returned;
        loan.returnedAt = uint64(block.timestamp);

        emit LoanReturned(
            loanId,
            loan.equipmentId,
            loan.borrower,
            loan.quantity,
            loan.returnedAt
        );
    }

    /// @notice Returns equipment metadata and current stock.
    function getEquipment(bytes32 equipmentId) external view returns (Equipment memory) {
        return _requireEquipment(equipmentId);
    }

    /// @notice Returns a loan record.
    function getLoan(bytes32 loanId) external view returns (Loan memory) {
        return _requireLoan(loanId);
    }

    function _requireEquipment(bytes32 equipmentId)
        private
        view
        returns (Equipment storage item)
    {
        item = _equipment[equipmentId];
        if (item.totalUnits == 0) revert EquipmentNotFound(equipmentId);
    }

    function _requireLoan(bytes32 loanId) private view returns (Loan storage loan) {
        loan = _loans[loanId];
        if (loan.state == LoanState.None) revert LoanNotFound(loanId);
    }

    function _requireState(bytes32 loanId, Loan storage loan, LoanState requiredState)
        private
        view
    {
        if (loan.state != requiredState) {
            revert InvalidLoanState(loanId, loan.state, requiredState);
        }
    }
}
