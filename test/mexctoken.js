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
});
