const path = require("path");

const solc = require("solc");
const fs = require("fs-extra");

const build = path.resolve(__dirname, "build");
fs.removeSync(build);

const fileNames = fs.readdirSync(path.resolve(__dirname, "contracts"));

const options = fileNames.reduce((prev, curr) => {
  const contract = fs.readFileSync(
    path.resolve(__dirname, "contracts", curr),
    "utf8"
  );

  return {
    ...prev,
    [curr]: {
      content: contract,
    },
  };
}, {});

const input = {
  language: "Solidity",
  sources: options,
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const compiled = JSON.parse(solc.compile(JSON.stringify(input))).contracts;

fs.ensureDirSync(build);

fileNames.forEach((file) => {
  const contracts = Object.keys(compiled[file]);

  contracts.forEach((contract) => {
    const contractPath = path.resolve(build, `${contract}.json`);
    fs.outputJsonSync(contractPath, compiled[file][contract]);
  });
});
