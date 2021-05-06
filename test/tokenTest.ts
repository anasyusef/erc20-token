import { expect } from "chai";
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";

describe("HummusToken", function () {
  // Tests basic functionality of the token
  let Hummus: ContractFactory;
  let hummus: Contract;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let repr: BigNumber;
  const INITIAL_SUPPLY = 1000;

  beforeEach(async function () {
    Hummus = await ethers.getContractFactory("Hummus");
    [owner, alice, bob, ...addrs] = await ethers.getSigners();
    hummus = await Hummus.deploy(INITIAL_SUPPLY);
    repr = ethers.BigNumber.from(10).pow(await hummus.decimals());
  });

  it("should set the owner to have the total's supply", async () => {
    expect(await hummus.totalSupply()).to.deep.equal(
      await hummus.balanceOf(owner.address)
    );
  });

  it("should match total supply when contract is deployed with initial supply", async () => {
    const bnInitialSupply = ethers.BigNumber.from(INITIAL_SUPPLY);
    expect(await hummus.totalSupply()).to.deep.equal(bnInitialSupply.mul(repr));
  });

  it("should be able to transfer from owner's address to another account", async () => {
    const amountToTransfer = ethers.BigNumber.from(50).mul(repr);
    await hummus.transfer(alice.address, amountToTransfer);
    expect(await hummus.balanceOf(owner.address)).to.deep.equal(
      (await hummus.totalSupply()).sub(amountToTransfer)
    );
    expect(await hummus.balanceOf(alice.address)).to.deep.equal(
      amountToTransfer
    );
  });
  it("should be able to transfer between accounts", async () => {
    const amountToTransfer = ethers.BigNumber.from(30).mul(repr);
    await hummus.transfer(alice.address, amountToTransfer);
    expect(await hummus.balanceOf(alice.address)).to.deep.equal(
      amountToTransfer
    );
    const aliceBalance = await hummus.balanceOf(alice.address);

    await hummus.connect(alice).transfer(bob.address, amountToTransfer);
    expect(await hummus.balanceOf(alice.address)).to.deep.equal(
      aliceBalance.sub(amountToTransfer)
    );
    expect(await hummus.balanceOf(bob.address)).to.deep.equal(amountToTransfer);
  });
});
