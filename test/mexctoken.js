const MEXCToken = artifacts.require("MEXCToken");

contract("MEXCToken", accounts => {
  let owner = accounts[0];
  let acc1 = accounts[1];
  let acc2 = accounts[2];
  let acc3 = accounts[3];
  let acc4 = accounts[4];

  const toWei = web3.utils.toWei;
  var mexc;

  beforeEach(async () => {
    mexc = await MEXCToken.deployed();
  });

  it("should enable transfer", async () => {
    assert.equal(
      true,
      await mexc.isTransferAllowed(),
      "Transfer should be allowed"
    );
  });

  it("should have the right token name and symbol", async () => {
    let name = await mexc.name();
    let symbol = await mexc.symbol();

    assert.equal("MEXC Token", name, "Symbol should be MEXC Token");
    assert.equal("MEXC", symbol, "Symbol should be MEXC");
  });

  it("should rename the token name and symbol", async () => {
    var name = await mexc.name();
    var symbol = await mexc.symbol();
    assert.equal("MEXC Token", name, "Symbol should be MEXC Token");
    assert.equal("MEXC", symbol, "Symbol should be MEXC");

    await mexc.renameToken("FOO", "FOO Token");
    var name = await mexc.name();
    var symbol = await mexc.symbol();

    assert.equal("FOO Token", name, "Symbol should be FOO Token");
    assert.equal("FOO", symbol, "Symbol should be FOO");
  });

  it("should have a max supply of 1714285714", async () => {
    let ms = await mexc.maxSupply();
    let ts = await mexc.totalSupply();

    assert.equal(
      1714285714 * 10 ** 18,
      ms,
      // toWei("1714285714", "ether"),
      "Max supply should be 1714285714"
    );
    assert.equal(0 * 10 ** 18, ts, "Max supply should be 0");
  });

  it("should increase the supply for another 1b", async () => {
    assert.equal(
      1714285714 * 10 ** 18,
      await mexc.maxSupply(),
      "Max supply should be 1714285714"
    );

    // increase another 1b
    await mexc.increaseSupply(toWei("1000000000", "ether"));

    assert.equal(
      2714285714 * 10 ** 18,
      await mexc.maxSupply(),
      "Max supply should be 2714285714"
    );
  });

  it("mint beyond 2b limit", async () => {
    assert.equal(
      2714285714 * 10 ** 18,
      await mexc.maxSupply(),
      "Max supply should be 2714285714"
    );

    // mint 3b MEXC
    try {
      await mexc.mint(acc1, toWei("3714285714", "ether"));
    } catch (e) {
      assert.equal(
        2714285714 * 10 ** 18,
        await mexc.maxSupply(),
        "Max supply should be 2714285714"
      );
    }
  });

  it("should mint 1000 MEXC to acc1", async () => {
    // check acc1 balance first
    var acc1Balance = await mexc.balanceOf(acc1);
    assert.equal(0 * 10 ** 18, acc1Balance, "Should be zero for now");

    // mint 1,000 MEXC to acc1
    await mexc.mint(acc1, toWei("1000", "ether"));
    var acc1Balance = await mexc.balanceOf(acc1);
    assert.equal(1000 * 10 ** 18, acc1Balance, "Should be 1000 for now");
  });

  it("should be able to transfer 200 MEXC to acc2", async () => {
    // allow the transfers first
    await mexc.allowTransfers();

    // Check the balance first
    var acc1Balance = await mexc.balanceOf(acc1);
    assert.equal(1000 * 10 ** 18, acc1Balance, "Should be 1000 for now");

    // transfer to acc2
    await mexc.transfer(acc2, toWei("200", "ether"), { from: acc1 });
    var acc2Balance = await mexc.balanceOf(acc2);
    assert.equal(200 * 10 ** 18, acc2Balance, "Should be 200 by now");

    // check for acc2
    var acc1Balance = await mexc.balanceOf(acc1);
    assert.equal(800 * 10 ** 18, acc1Balance, "Should be 800 for now");
  });

  it("acc2 should have 200 MEXC, and cannot transfer to acc3", async () => {
    var acc2Balance = await mexc.balanceOf(acc2);
    assert.equal(200 * 10 ** 18, acc2Balance, "Should be 200 by now");

    // lock acc2 from transfer
    await mexc.lockAddress(acc2);

    // try to transfer to acc3
    try {
      await mexc.transfer(acc3, toWei("100", "ether"), { from: acc2 });
    } catch (e) {
      // above should fail.
      assert.equal(
        200 * 10 ** 18,
        await mexc.balanceOf(acc2),
        "Should still be 200 as transfer is locked"
      );
      assert.equal(
        0 * 10 ** 18,
        await mexc.balanceOf(acc3),
        "Should be 0 as no transfer happened"
      );
    }
  });

  it("acc2 can now transfer to acc3", async () => {
    await mexc.unlockAddress(acc2, { from: owner });
    await mexc.transfer(acc3, toWei("100", "ether"), { from: acc2 });
    assert.equal(
      100 * 10 ** 18,
      await mexc.balanceOf(acc2),
      "Should be 100, after transfer of 100 to acc3"
    );
    assert.equal(
      100 * 10 ** 18,
      await mexc.balanceOf(acc3),
      "acc3 balance should be 100 after received from acc2"
    );
  });

  it("burn the amount in acc3", async () => {
    var ts = await mexc.totalSupply();
    assert.equal(1000 * 10 ** 18, ts, "Should be 1,000");

    // get balance of acc3
    assert.equal(
      100 * 10 ** 18,
      await mexc.balanceOf(acc3),
      "acc3 balance should be 100 after received from acc2"
    );

    // burn acc3
    await mexc.burn(acc3, toWei("100", "ether"), { from: owner });
    assert.equal(
      0 * 10 ** 18,
      await mexc.balanceOf(acc3),
      "Balance of acc3 should be 0 again"
    );
  });

  it("total supply should be 900", async () => {
    // total supply should reduce
    var ts1 = await mexc.totalSupply();
    assert.equal(900 * 10 ** 18, ts1, "total supply should be 900");
  });

  it("Mint and lock acc4, and acc4 should not be able to transfer", async () => {
    // mint to acc4
    await mexc.mintThenLock(acc4, toWei("2000", "ether"));
    // await mexc.lockAddress(acc4);

    assert.equal(
      2900 * 10 ** 18,
      await mexc.totalSupply(),
      "total supply should be 2900, after minting new 2,000 MEXC"
    );

    assert.equal(
      2000 * 10 ** 18,
      await mexc.balanceOf(acc4),
      "acc4 balances should be 2000 by now"
    );

    // try to send out
    try {
      assert.equal(
        100 * 10 ** 18,
        await mexc.balanceOf(acc2),
        "acc2 balance should be 100"
      );

      // this would fail
      await mexc.transfer(acc2, toWei("100", "ether"), { from: acc4 });
    } catch (e) {
      assert.equal(
        2000 * 10 ** 18,
        await mexc.balanceOf(acc4),
        "acc4 balance should still be 2000 for now"
      );

      // ok, now unlock
      await mexc.unlockAddress(acc4);
      await mexc.transfer(acc2, toWei("100", "ether"), { from: acc4 });

      assert.equal(
        200 * 10 ** 18,
        await mexc.balanceOf(acc2),
        "acc2 should be 200 by now, after 100 MEXC transfer from acc4"
      );

      assert.equal(
        1900 * 10 ** 18,
        await mexc.balanceOf(acc4),
        "acc4 balance should be 1900 MEXC, after transferring 100 to acc2"
      );
    }
  });

  // transfer ownership to acc1, and mint to acc2 for 300
  it("should transfer ownership to acc1, and mint acc2 for 300", async () => {
    await mexc.transferOwnership(acc1, { from: owner });

    // acc1 mint acc2 for 300;
    assert.equal(
      200 * 10 ** 18,
      await mexc.balanceOf(acc2),
      "acc2 should be 200"
    );

    // mint 200 for acc2
    await mexc.mint(acc2, toWei("200", "ether"), { from: acc1 });

    assert.equal(
      400 * 10 ** 18,
      await mexc.balanceOf(acc2),
      "acc2 should be 400 by now, after minted 200 from acc1"
    );
  });

  it("previous owner cannot burn, mint and do all with super privileges", async () => {
    try {
      // owner cannot mint, and this would fail
      await mexc.mint(acc2, toWei("200", "ether"), { from: owner });
    } catch (e) {
      assert.equal(
        400 * 10 ** 18,
        await mexc.balanceOf(acc2),
        "acc2 should still be 400 MEXC"
      );
    }

    // try to burn amount
    try {
      await mexc.burn(acc2, toWei("400", "ether"), { from: owner });
    } catch (e) {
      assert.equal(
        400 * 10 ** 18,
        await mexc.balanceOf(acc2),
        "acc2 should still be 400 MEXC"
      );
    }
  });
});
