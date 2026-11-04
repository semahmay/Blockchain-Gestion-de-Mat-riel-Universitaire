import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import type { EquipmentLending } from "../typechain-types";

const EQUIPMENT_ID = ethers.id("EQ-INF-001");
const SCARCE_EQUIPMENT_ID = ethers.id("EQ-INF-003");
const LOAN_ID = ethers.id("LN-1001");
const SECOND_LOAN_ID = ethers.id("LN-1002");
const UNKNOWN_LOAN_ID = ethers.id("LN-9999");
const REASON_CODE = ethers.id("STOCK_INSUFFICIENT");
const ADMIN_ROLE = ethers.id("ADMIN_ROLE");

const LoanState = {
  Pending: 1n,
  Approved: 2n,
  Rejected: 3n,
  Returned: 4n,
  Cancelled: 5n,
} as const;

function asSigner(
  contract: EquipmentLending,
  signer: Signer,
): EquipmentLending {
  return contract.connect(signer) as unknown as EquipmentLending;
}

async function deployFixture() {
  const [admin, student, secondStudent, otherStudent, outsider] =
    await ethers.getSigners();

  const factory = await ethers.getContractFactory("EquipmentLending");
  const contract = (await factory.deploy()) as unknown as EquipmentLending;
  await contract.waitForDeployment();

  return { contract, admin, student, secondStudent, otherStudent, outsider };
}

async function deployWithEquipment() {
  const fixture = await loadFixture(deployFixture);
  await fixture.contract.registerEquipment(
    EQUIPMENT_ID,
    "EQ-INF-001",
    'MacBook Pro 14" M3',
    3,
  );
  return fixture;
}

async function requestFirstLoan() {
  const fixture = await deployWithEquipment();
  await asSigner(fixture.contract, fixture.student)
    .requestLoan(LOAN_ID, EQUIPMENT_ID, 2);
  return fixture;
}

describe("EquipmentLending", () => {
  describe("Deployment and access control", () => {
    it("grants both admin roles to the deployer", async () => {
      const { contract, admin } = await loadFixture(deployFixture);

      expect(
        await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), admin.address),
      ).to.equal(true);
      expect(await contract.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);
    });

    it("prevents non-administrators from registering equipment", async () => {
      const { contract, outsider } = await loadFixture(deployFixture);

      await expect(
        asSigner(contract, outsider)
          .registerEquipment(EQUIPMENT_ID, "EQ-INF-001", "Laptop", 1),
      )
        .to.be.revertedWithCustomError(
          contract,
          "AccessControlUnauthorizedAccount",
        )
        .withArgs(outsider.address, ADMIN_ROLE);
    });
  });

  describe("Equipment registration", () => {
    it("registers equipment with its initial available stock", async () => {
      const { contract } = await loadFixture(deployFixture);

      await expect(
        contract.registerEquipment(
          EQUIPMENT_ID,
          "EQ-INF-001",
          'MacBook Pro 14" M3',
          3,
        ),
      )
        .to.emit(contract, "EquipmentRegistered")
        .withArgs(EQUIPMENT_ID, "EQ-INF-001", 'MacBook Pro 14" M3', 3);

      const equipment = await contract.getEquipment(EQUIPMENT_ID);
      expect(equipment.assetReference).to.equal("EQ-INF-001");
      expect(equipment.name).to.equal('MacBook Pro 14" M3');
      expect(equipment.totalUnits).to.equal(3n);
      expect(equipment.availableUnits).to.equal(3n);
      expect(equipment.active).to.equal(true);
      expect(equipment.registeredAt).to.not.equal(0n);
      expect(await contract.equipmentCount()).to.equal(1n);
    });

    it("rejects duplicate equipment IDs", async () => {
      const { contract } = await deployWithEquipment();

      await expect(
        contract.registerEquipment(EQUIPMENT_ID, "EQ-INF-001", "Duplicate", 1),
      )
        .to.be.revertedWithCustomError(contract, "EquipmentAlreadyRegistered")
        .withArgs(EQUIPMENT_ID);
    });

    it("rejects zero stock, empty metadata, and the zero equipment ID", async () => {
      const { contract } = await loadFixture(deployFixture);

      await expect(
        contract.registerEquipment(EQUIPMENT_ID, "EQ-INF-001", "Laptop", 0),
      )
        .to.be.revertedWithCustomError(contract, "InvalidQuantity");

      await expect(
        contract.registerEquipment(EQUIPMENT_ID, "", "Laptop", 1),
      ).to.be.revertedWithCustomError(contract, "EmptyEquipmentMetadata");

      await expect(
        contract.registerEquipment(ethers.ZeroHash, "EQ-INF-001", "Laptop", 1),
      ).to.be.revertedWithCustomError(contract, "InvalidEquipmentId");
    });

    it("allows an administrator to change equipment availability", async () => {
      const { contract } = await deployWithEquipment();

      await expect(contract.setEquipmentActive(EQUIPMENT_ID, false))
        .to.emit(contract, "EquipmentAvailabilityChanged")
        .withArgs(EQUIPMENT_ID, false);

      const equipment = await contract.getEquipment(EQUIPMENT_ID);
      expect(equipment.active).to.equal(false);
    });
  });

  describe("Loan requests", () => {
    it("creates a pending request without reserving stock", async () => {
      const { contract, student } = await deployWithEquipment();

      await expect(
        asSigner(contract, student).requestLoan(LOAN_ID, EQUIPMENT_ID, 2),
      )
        .to.emit(contract, "LoanRequested")
        .withArgs(LOAN_ID, EQUIPMENT_ID, student.address, 2, anyValue);

      const loan = await contract.getLoan(LOAN_ID);
      expect(loan.equipmentId).to.equal(EQUIPMENT_ID);
      expect(loan.borrower).to.equal(student.address);
      expect(loan.quantity).to.equal(2n);
      expect(loan.state).to.equal(LoanState.Pending);
      expect(loan.requestedAt).to.not.equal(0n);
      expect(await contract.loanCount()).to.equal(1n);

      const equipment = await contract.getEquipment(EQUIPMENT_ID);
      expect(equipment.availableUnits).to.equal(3n);
    });

    it("rejects requests for unknown or inactive equipment", async () => {
      const { contract, student } = await deployWithEquipment();

      await expect(
        asSigner(contract, student)
          .requestLoan(LOAN_ID, ethers.id("UNKNOWN"), 1),
      )
        .to.be.revertedWithCustomError(contract, "EquipmentNotFound")
        .withArgs(ethers.id("UNKNOWN"));

      await contract.setEquipmentActive(EQUIPMENT_ID, false);

      await expect(
        asSigner(contract, student).requestLoan(LOAN_ID, EQUIPMENT_ID, 1),
      )
        .to.be.revertedWithCustomError(contract, "EquipmentInactive")
        .withArgs(EQUIPMENT_ID);
    });

    it("rejects zero quantities and the zero loan ID", async () => {
      const { contract, student } = await deployWithEquipment();

      await expect(
        asSigner(contract, student).requestLoan(LOAN_ID, EQUIPMENT_ID, 0),
      ).to.be.revertedWithCustomError(contract, "InvalidQuantity");

      await expect(
        asSigner(contract, student).requestLoan(
          ethers.ZeroHash,
          EQUIPMENT_ID,
          1,
        ),
      ).to.be.revertedWithCustomError(contract, "InvalidLoanId");
    });

    it("rejects requests above available stock", async () => {
      const { contract, student } = await deployWithEquipment();

      await expect(
        asSigner(contract, student).requestLoan(LOAN_ID, EQUIPMENT_ID, 4),
      )
        .to.be.revertedWithCustomError(contract, "InsufficientStock")
        .withArgs(EQUIPMENT_ID, 4, 3);
    });

    it("rejects duplicate loan IDs", async () => {
      const { contract, student, secondStudent } = await deployWithEquipment();

      await asSigner(contract, student)
        .requestLoan(LOAN_ID, EQUIPMENT_ID, 1);

      await expect(
        asSigner(contract, secondStudent)
          .requestLoan(LOAN_ID, EQUIPMENT_ID, 1),
      )
        .to.be.revertedWithCustomError(contract, "LoanAlreadyExists")
        .withArgs(LOAN_ID);
    });
  });

  describe("Administrator decisions", () => {
    it("approves a pending request, reserves stock, and emits an event", async () => {
      const { contract, student } = await requestFirstLoan();

      await expect(contract.approveLoan(LOAN_ID))
        .to.emit(contract, "LoanApproved")
        .withArgs(
          LOAN_ID,
          EQUIPMENT_ID,
          student.address,
          2,
          anyValue,
        );

      const loan = await contract.getLoan(LOAN_ID);
      expect(loan.state).to.equal(LoanState.Approved);
      expect(loan.decidedAt).to.not.equal(0n);

      const equipment = await contract.getEquipment(EQUIPMENT_ID);
      expect(equipment.availableUnits).to.equal(1n);
    });

    it("prevents non-administrators from approving or rejecting a request", async () => {
      const { contract, outsider } = await requestFirstLoan();

      await expect(asSigner(contract, outsider).approveLoan(LOAN_ID))
        .to.be.revertedWithCustomError(
          contract,
          "AccessControlUnauthorizedAccount",
        )
        .withArgs(outsider.address, ADMIN_ROLE);

      await expect(
        asSigner(contract, outsider).rejectLoan(LOAN_ID, REASON_CODE),
      )
        .to.be.revertedWithCustomError(
          contract,
          "AccessControlUnauthorizedAccount",
        )
        .withArgs(outsider.address, ADMIN_ROLE);
    });

    it("prevents duplicate processing of an approved request", async () => {
      const { contract } = await requestFirstLoan();
      await contract.approveLoan(LOAN_ID);

      await expect(contract.approveLoan(LOAN_ID))
        .to.be.revertedWithCustomError(contract, "InvalidLoanState")
        .withArgs(LOAN_ID, LoanState.Approved, LoanState.Pending);
    });

    it("rejects approval when stock has already been reserved", async () => {
      const { contract, student, secondStudent } = await deployWithEquipment();
      await contract.registerEquipment(
        SCARCE_EQUIPMENT_ID,
        "EQ-INF-003",
        "Scarce item",
        1,
      );

      await asSigner(contract, student)
        .requestLoan(LOAN_ID, SCARCE_EQUIPMENT_ID, 1);
      await asSigner(contract, secondStudent)
        .requestLoan(SECOND_LOAN_ID, SCARCE_EQUIPMENT_ID, 1);

      await contract.approveLoan(LOAN_ID);

      await expect(contract.approveLoan(SECOND_LOAN_ID))
        .to.be.revertedWithCustomError(contract, "InsufficientStock")
        .withArgs(SCARCE_EQUIPMENT_ID, 1, 0);
    });

    it("blocks approval when the equipment has been deactivated", async () => {
      const { contract } = await requestFirstLoan();
      await contract.setEquipmentActive(EQUIPMENT_ID, false);

      await expect(contract.approveLoan(LOAN_ID))
        .to.be.revertedWithCustomError(contract, "EquipmentInactive")
        .withArgs(EQUIPMENT_ID);
    });

    it("rejects a pending request without changing stock", async () => {
      const { contract, student } = await requestFirstLoan();

      await expect(contract.rejectLoan(LOAN_ID, REASON_CODE))
        .to.emit(contract, "LoanRejected")
        .withArgs(
          LOAN_ID,
          EQUIPMENT_ID,
          student.address,
          REASON_CODE,
          anyValue,
        );

      const loan = await contract.getLoan(LOAN_ID);
      expect(loan.state).to.equal(LoanState.Rejected);
      expect(loan.rejectionReason).to.equal(REASON_CODE);
      expect(loan.decidedAt).to.not.equal(0n);

      const equipment = await contract.getEquipment(EQUIPMENT_ID);
      expect(equipment.availableUnits).to.equal(3n);
    });

    it("prevents approval after a rejection", async () => {
      const { contract } = await requestFirstLoan();
      await contract.rejectLoan(LOAN_ID, REASON_CODE);

      await expect(contract.approveLoan(LOAN_ID))
        .to.be.revertedWithCustomError(contract, "InvalidLoanState")
        .withArgs(LOAN_ID, LoanState.Rejected, LoanState.Pending);
    });
  });

  describe("Cancellation", () => {
    it("allows the borrower to cancel a pending request", async () => {
      const { contract, student } = await requestFirstLoan();

      await expect(asSigner(contract, student).cancelLoan(LOAN_ID))
        .to.emit(contract, "LoanCancelled")
        .withArgs(LOAN_ID, EQUIPMENT_ID, student.address, anyValue);

      const loan = await contract.getLoan(LOAN_ID);
      expect(loan.state).to.equal(LoanState.Cancelled);
      expect(loan.cancelledAt).to.not.equal(0n);

      const equipment = await contract.getEquipment(EQUIPMENT_ID);
      expect(equipment.availableUnits).to.equal(3n);
    });

    it("prevents another account from cancelling the borrower's request", async () => {
      const { contract, otherStudent } = await requestFirstLoan();

      await expect(asSigner(contract, otherStudent).cancelLoan(LOAN_ID))
        .to.be.revertedWithCustomError(contract, "UnauthorizedBorrower")
        .withArgs(LOAN_ID, otherStudent.address);
    });

    it("prevents cancelling twice or cancelling an approved loan", async () => {
      const { contract, student } = await requestFirstLoan();
      await asSigner(contract, student).cancelLoan(LOAN_ID);

      await expect(asSigner(contract, student).cancelLoan(LOAN_ID))
        .to.be.revertedWithCustomError(contract, "InvalidLoanState")
        .withArgs(LOAN_ID, LoanState.Cancelled, LoanState.Pending);

      await asSigner(contract, student)
        .requestLoan(SECOND_LOAN_ID, EQUIPMENT_ID, 1);
      await contract.approveLoan(SECOND_LOAN_ID);

      await expect(asSigner(contract, student).cancelLoan(SECOND_LOAN_ID))
        .to.be.revertedWithCustomError(contract, "InvalidLoanState")
        .withArgs(SECOND_LOAN_ID, LoanState.Approved, LoanState.Pending);
    });
  });

  describe("Returns", () => {
    it("records a return, restores stock, and prevents duplicate returns", async () => {
      const { contract, student } = await requestFirstLoan();
      await contract.approveLoan(LOAN_ID);

      await expect(contract.recordReturn(LOAN_ID))
        .to.emit(contract, "LoanReturned")
        .withArgs(
          LOAN_ID,
          EQUIPMENT_ID,
          student.address,
          2,
          anyValue,
        );

      const loan = await contract.getLoan(LOAN_ID);
      expect(loan.state).to.equal(LoanState.Returned);
      expect(loan.returnedAt).to.not.equal(0n);

      const equipment = await contract.getEquipment(EQUIPMENT_ID);
      expect(equipment.availableUnits).to.equal(3n);

      await expect(contract.recordReturn(LOAN_ID))
        .to.be.revertedWithCustomError(contract, "InvalidLoanState")
        .withArgs(LOAN_ID, LoanState.Returned, LoanState.Approved);
    });

    it("rejects returns for loans that are not approved", async () => {
      const { contract } = await requestFirstLoan();

      await expect(contract.recordReturn(LOAN_ID))
        .to.be.revertedWithCustomError(contract, "InvalidLoanState")
        .withArgs(LOAN_ID, LoanState.Pending, LoanState.Approved);
    });

    it("prevents non-administrators from recording returns", async () => {
      const { contract, outsider } = await requestFirstLoan();
      await contract.approveLoan(LOAN_ID);

      await expect(asSigner(contract, outsider).recordReturn(LOAN_ID))
        .to.be.revertedWithCustomError(
          contract,
          "AccessControlUnauthorizedAccount",
        )
        .withArgs(outsider.address, ADMIN_ROLE);
    });
  });

  describe("Unknown loans", () => {
    it("rejects operations on an unknown loan ID", async () => {
      const { contract, student } = await deployWithEquipment();

      await expect(contract.approveLoan(UNKNOWN_LOAN_ID))
        .to.be.revertedWithCustomError(contract, "LoanNotFound")
        .withArgs(UNKNOWN_LOAN_ID);

      await expect(contract.rejectLoan(UNKNOWN_LOAN_ID, REASON_CODE))
        .to.be.revertedWithCustomError(contract, "LoanNotFound")
        .withArgs(UNKNOWN_LOAN_ID);

      await expect(asSigner(contract, student).cancelLoan(UNKNOWN_LOAN_ID))
        .to.be.revertedWithCustomError(contract, "LoanNotFound")
        .withArgs(UNKNOWN_LOAN_ID);

      await expect(contract.recordReturn(UNKNOWN_LOAN_ID))
        .to.be.revertedWithCustomError(contract, "LoanNotFound")
        .withArgs(UNKNOWN_LOAN_ID);
    });
  });
});


