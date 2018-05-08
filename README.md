# Truffle pet-shop installation and setup guide
### Source
1. [http://truffleframework.com/boxes/pet-shop]()
2. [http://truffleframework.com/tutorials/pet-shop]()
3. [http://truffleframework.com/tutorials/]()

### Steps
1. Install Truffle.
```sh
$ npm install -g truffle
```
2. Install pet-shop box in a directory `pet-shop`. To understand the directory structure read [this guide](http://truffleframework.com/tutorials/pet-shop).
```sh
$ mkdir pet-shop
$ cd pet-shop
$ truffle unbox pet-shop
```
3. Go to `/contracts` directory and create a new file `Adoption.sol` and save the following content.
```js
pragma solidity ^0.4.17;

contract Adoption {

	address[16] public adopters;

	// Adopting a pet
	function adopt(uint petId) public returns (uint) {
	  require(petId >= 0 && petId <= 15);

	  adopters[petId] = msg.sender;

	  return petId;
	}

	// Retrieving the adopters
	function getAdopters() public view returns (address[16]) {
	  return adopters;
	}
}
```
4. In the `Migrations.sol` file in the `/contracts` directory, modify the **Old code** with the **New code**.

**Old code**
```js
  function Migrations() public {
    owner = msg.sender;
  }
```
**New code**
```js
  constructor() public {
    owner = msg.sender;
  }
```
5. Go back to the `pet-shop` root directory `/` run the truffle development console.
```sh
truffle develop
```
6. Compile the smart contracts. Note, inside the development console we don't need to prefix commands with `truffle`. If you're outside prefix commands with `truffle`.
```sh
> compile
```
You should see output similar to the following:
```sh
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Adoption.sol...
Writing artifacts to ./build/contracts
```
7. Now that we've successfully compiled our contracts, it's time to **migrate** them to the blockchain! To know about migration read the [migration documentation](http://truffleframework.com/docs/getting_started/migrations) and [this guide](http://truffleframework.com/tutorials/pet-shop). You will see one JavaScript file already in the `migrations/` directory: `1_initial_migration.js`. This handles deploying the `Migrations.sol` contract. Now we are ready to create our own migration script.
- Create a new file named `2_deploy_contracts.js` in the `migrations/ directory`.
- Add the following content to the `2_deploy_contracts.js` file:
```js
var Adoption = artifacts.require("Adoption");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
};
```
- Before we can migrate our contract to the blockchain, we need to have a blockchain running. For this tutorial, we're going to use [Ganache](http://truffleframework.com/ganache), a personal blockchain for Ethereum development you can use to deploy contracts, develop applications, and run tests. If you haven't already, [download Ganache](http://truffleframework.com/ganache) and double click the icon to launch the application. This will generate a blockchain running locally on port **7545**. Read the ganache documentation [here](http://truffleframework.com/docs/ganache/using).
- Back in the terminal, migrate the contract to the blockchain. Note, for this step you must be in the `pet-shop/` root in the terminal, and not the `truffle develop` environment
```sh
$ truffle migrate
```
- You should see output similar to the following. You can see the migrations being executed in order, followed by the blockchain address of each deployed contract. (Your addresses will differ.)
```sh
Using network 'development'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0xcc1a5aea7c0a8257ba3ae366b83af2d257d73a5772e84393b0576065bf24aedf
  Migrations: 0x8cdaf0cd259887258bc13a92c0a6da92698644c0
Saving successful migration to network...
  ... 0xd7bc86d31bee32fa3988f1c1eabce403a1b5d570340a3a9cdba53a472ee8c956
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying Adoption...
  ... 0x43b6a6888c90c38568d4f9ea494b9e2a22f55e506a8197938fb1bb6e5eaa5d34
  Adoption: 0x345ca3e014aaf5dca488057592ee47305d9b3e10
Saving successful migration to network...
  ... 0xf36163615f41ef7ed8f4a8f192149a0bf633fe1a2398ce001bf44c43dc7bdda0
Saving artifacts...
```
- In Ganache, note that the state of the blockchain has changed. The blockchain now shows that the current block, previously `0`, is now `4`. In addition, while the first account originally had `100` ether, it is now lower, due to the transaction costs of migration. We'll talk more about transaction costs later.

8. Now we will test the smart contract. Truffle is very flexible when it comes to smart contract testing, in that tests can be written either in JavaScript or Solidity. In this tutorial, we'll be writing our tests in Solidity.
- Create a new file named `TestAdoption.sol` in the `test/ directory`.
- Add the following content to the `TestAdoption.sol` file:
```js
pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
  Adoption adoption = Adoption(DeployedAddresses.Adoption());
  // Testing the adopt() function
  
  /// #1
  function testUserCanAdoptPet() public {
	uint returnedId = adoption.adopt(8);
	uint expected = 8;
	Assert.equal(returnedId, expected, "Adoption of pet ID 8 should be recorded.");
	}
	
	/// #2
	// Testing retrieval of a single pet's owner
	function testGetAdopterAddressByPetId() public {
	// Expected owner is this contract
	address expected = this;
    address adopter = adoption.adopters(8);
    Assert.equal(adopter, expected, "Owner of pet ID 8 should be recorded.");
	}	
	
	/// #3
	// Testing retrieval of all pet owners
	function testGetAdopterAddressByPetIdInArray() public {
	// Expected owner is this contract
	address expected = this;

	// Store adopters in memory rather than storage of contract
	address[16] memory adopters = adoption.getAdopters();

	Assert.equal(adopters[8], expected, "Owner of pet ID 8 should be recorded.");
	}
}
``` 
- We start the contract off with 3 imports. The first two imports are referring to global Truffle files, not a `truffle` directory. You should not see a `truffle` directory inside your `test/` directory.
-- `Assert.sol`: Gives us various assertions to use in our tests.
-- `DeployedAddresses.sol`: This smart contract gets the address of the deployed contract.
-- `Adoption.sol`: The smart contract we want to test.
- Now we can test the `adopt()` function. Recall that upon success it returns the given `petId`. We can ensure an ID was returned and that it's correct by comparing the return value of `adopt()` to the ID we passed in.
- *Things to notice*:
-- We call the smart contract we declared earlier with the ID of `8`.
-- We then declare an expected value of `8` as well.
-- Finally, we pass the actual value, the expected value and a failure message (which gets printed to the console if the test does not pass) to `Assert.equal()`.
- Note the **memory** attribute on `adopters`. The memory attribute tells Solidity to temporarily store the value in memory, rather than saving it to the contract's storage. Since `adopters` is an array, and we know from the first adoption test that we adopted pet `8`, we compare the testing contracts address with location `8` in the array.
9. Now we will run the tests.
- Back in the terminal, run the tests:
```sh
$ truffle test
```
- If all the tests pass, you'll see console output similar to this:
```js
Using network 'development'.

Compiling ./contracts/Adoption.sol...
Compiling ./test/TestAdoption.sol...
Compiling truffle/Assert.sol...
Compiling truffle/DeployedAddresses.sol...


  TestAdoption
    ✓ testUserCanAdoptPet (107ms)
    ✓ testGetAdopterAddressByPetId (88ms)
    ✓ testGetAdopterAddressByPetIdInArray (136ms)


  3 passing (2s)
```

10. Now we will create a user-interface to interact with the smart contract. Included with the `pet-shop` Truffle Box was code for the app's front-end. That code exists within the `src/` directory. Now we will instantiate `web3`. Open /src/js/app.js and update it with following code. We are basically updating four functions: `initWeb3`, `initContract`, `markAdopted`, `handleAdopt`. To know about about these updates read [this guide](http://truffleframework.com/tutorials/pet-shop#creating-a-user-interface-to-interact-with-the-smart-contract).

```js
App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var AdoptionArtifact = data;
    App.contracts.Adoption = TruffleContract(AdoptionArtifact);

    // Set the provider for our contract
    App.contracts.Adoption.setProvider(App.web3Provider);

    // Use our contract to retrieve and mark the adopted pets
    return App.markAdopted();
  });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
```
11. Now we will interact with the dapp in a browser. The easiest way to interact with our dapp in a browser is through [MetaMask](https://metamask.io/), a browser extension for both Chrome and Firefox.
- If you are a new user of MetaMask, follow the steps given in this [this guide](http://truffleframework.com/tutorials/pet-shop#interacting-with-the-dapp-in-a-browser)
- If you are existing user of MetaMask the follow the following steps.
-- Logout of MetaMask
-- Click on *Restore from seed phrase*
-- Copy MNEMONIC seed from Ganache App and paste in MetaMask and choose a password of your choice and click *OK*.
-- From the dropdown, we need to connect MetaMask to the blockchain created by Ganache. Click the menu that shows "Main Network" and select *Custom RPC*.
-- In the box titled *New RPC URL* enter http://127.0.0.1:7545 and click *Save*.
-- Go back and confirm balance.

12. Open `bs-config.json` from the project's root directory and update it to following.
```json
{
  "server": {
    "baseDir": ["./src", "./build/contracts"]
  },
  "scripts": {
  "dev": "lite-server",
  "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

13. Start the local web server:
```sh
npm run dev
```
- To use the dapp, click the Adopt button on the pet of your choice.
- You'll be automatically prompted to approve the transaction by MetaMask. Click Submit to approve the transaction.
- You'll see the button next to the adopted pet change to say "Success" and become disabled, just as we specified, because the pet has now been adopted.
- You'll also see the same transaction listed in Ganache under the "Transactions" section.

### Congratulations! 
You have taken a huge step to becoming a full-fledged dapp developer. For developing locally, you have all the tools you need to start making more advanced dapps. If you'd like to make your dapp live for others to use, stay tuned for our future tutorial on deploying to the Ropsten testnet.

