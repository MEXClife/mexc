const MEXCToken = artifacts.require("MEXCToken");

contract("MEXCToken", accounts => {
  let owner = accounts[0];
  let acc1 = accounts[1];
  let acc2 = accounts[2];
  let acc3 = accounts[3];

  const toWei = web3.utils.toWei;

  it("should have the right token name and symbol", async () => {
    // let name = await mexc.name();
    // let symbol = await mexc.symbol();
    let mexc = await MEXCToken.deployed();
    let name = await mexc.name();
    let symbol = await mexc.symbol();

    assert.equal("MEXC Token", name, "Symbol should be MEXC Token");
    assert.equal("MEXC", symbol, "Symbol should be MEXC");
  });

  it("should rename the token name and symbol", async () => {
    let mexc = await MEXCToken.deployed();
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
    let mexc = await MEXCToken.deployed();
    let ts = await mexc.maxSupply();
    let cs = await mexc.totalSupply();

    assert.equal(
      1714285714 * 10 ** 18,
      toWei("1714285714", "ether"),
      "Max supply should be 1714285714"
    );
    assert.equal(
      0 * 10 ** 18,
      toWei("0", "ether"),
      "Max supply should be 1714285714"
    );
  });
});
