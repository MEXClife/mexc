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

    // lock acc2
    await mexc.lockAddress(acc2);

    // try to transfer to acc3
    try {
      await mexc.transfer(acc3, toWei("100", "ether"), { from: acc2 });
    } catch (e) {
      // above should fail.
      assert.equal(
        200 * 10 ** 18,
        await mexc.balanceOf(acc2),
        "Should be 200 again"
      );
      assert.equal(
        0 * 10 ** 18,
        await mexc.balanceOf(acc3),
        "Should be 0 again"
      );
    }
  });

  it("acc2 can now transfer to acc3", async () => {
    await mexc.unlockAddress(acc2, { from: owner });
    await mexc.transfer(acc3, toWei("100", "ether"), { from: acc2 });
    assert.equal(
      100 * 10 ** 18,
      await mexc.balanceOf(acc2),
      "Should be 200 again"
    );
    assert.equal(
      100 * 10 ** 18,
      await mexc.balanceOf(acc3),
      "Should be 0 again"
    );
  });

  it("burn the amount in acc3", async () => {
    var ts = await mexc.totalSupply();
    assert.equal(1000 * 10 ** 18, ts, "Should be 1,000");

    // burn acc3
    await mexc.burn(acc3, toWei("100", "ether"), { from: owner });
    assert.equal(0 * 10 ** 18, await mexc.balanceOf(acc3), "Should be 0 again");
  });

  it("total supply should be 900", async () => {
    // total supply should reduce
    var ts1 = await mexc.totalSupply();
    assert.equal(900 * 10 ** 18, ts1, "total supply should be 900");
  });

  it("Mint and lock acc4, and acc4 should not be able to transfer", async () => {
    // mint to acc4
    await mexc.mintThenLock(acc4, toWei("2000", "ether"));
    assert.equal(
      2900 * 10 ** 18,
      await mexc.totalSupply(),
      "total supply should be 900"
    );
    var balance = await mexc.balanceOf(acc4);
    assert.equal(2000 * 10 ** 18, balance, "Should be 2000 for now");
  });
});
