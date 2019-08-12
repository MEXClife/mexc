const MEXCToken = artifacts.require("MEXCToken");

contract("MEXCToken", accounts => {
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
    await mexc.renameToken("FOO", "FOO Token");
    let name = await mexc.name();
    let symbol = await mexc.symbol();

    assert.equal("FOO Token", name, "Symbol should be FOO Token");
    assert.equal("FOO", symbol, "Symbol should be FOO");
  });

  it("should have a max supply of 1714285714", async () => {
    let mexc = await MEXCToken.deployed();
    let ts = await mexc.maxSupply();

    assert.equal(1714285714, ts.toNumber(), "Max supply should be 1714285714");
  });
});
