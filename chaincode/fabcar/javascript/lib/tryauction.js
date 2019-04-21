/*
 * SPDX-License-Identifier: Apache-2.0
 */

/*
    Invoke Commands:
        intiLedger()
        createVehicle(vehicleId, ownerId)
        createVehicleListing(listingId, reservePrice, description, state=['FOR_SALE','RESERVE_NOT_MET','SOLD'], vehicleId)
        createMember(ownerId, firstname, lastname, balance)
        makeOffer(bid, listingId, memId)
        closeBidding(listingId)
    Query Commands:
        queryLot(query)
        queryMember(query)
        queryAllLots()
*/

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        let member1 = {};
        member1.balance = 5000;
        member1.firstName = 'Amy';
        member1.lastName = 'Williams';

        let member2 = {};
        member2.balance = 5000;
        member2.firstName = 'Billy';
        member2.lastName = 'Thompson';

        let member3 = {};
        member3.balance = 5000;
        member3.firstName = 'Tom';
        member3.lastName = 'Werner';

        let vehicle = {};
        vehicle.owner = 'MEM1';

        let vehicleListing = {};
        vehicleListing.reservePrice = 3500;
        vehicleListing.description = 'Arium Nova';
        vehicleListing.listingState = 'FOR_SALE';
        vehicleListing.offers = '';
        vehicleListing.vehicle = '123456';

        await ctx.stub.putState('MEM1', Buffer.from(JSON.stringify(member1)));
        await ctx.stub.putState('MEM2', Buffer.from(JSON.stringify(member2)));
        await ctx.stub.putState('MEM3', Buffer.from(JSON.stringify(member3)));
        await ctx.stub.putState('123456', Buffer.from(JSON.stringify(vehicle)));
        await ctx.stub.putState('LOT1', Buffer.from(JSON.stringify(vehicleListing)));

        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * Create a vehicle object in the state
     * @param arg[0] - key for the car (vehicle id number)
     * @param arg[1] - owner of the car - should reference the email of a member
     * onSuccess - create and update the state with a new vehicle object
     */

    async createVehicle(ctx, args) {
      console.info('============= START : Create Item ===========');
      if (args.length != 2) {
        throw new Error('Incorrect number of arguments. Expecting 2');
      }

      var car = {
        owner: args[1]
      };

      await ctx.stub.putState(args[0], Buffer.from(JSON.stringify(car)));
      console.info('============= END : Create Item ===========');
    }

    /**
     * Create a vehicle listing object in the state
     * @param arg[0] - key for the vehicle listing (listing number)
     * @param arg[1] - reservePrice, or the minimum acceptable offer for a vehicle
     * @param arg[2] - description of the object
     * @param arg[3] - state of the listing, can be 'FOR_SALE', 'RESERVE_NOT_MET', or 'SOLD'
     * @param arg[4] - reference to the vehicle id (vin) which is to be put on auction
     * onSuccess - create and update the state with a new vehicle listing object
     */

    async createVehicleListing(ctx, args) {
      console.info('============= START : Create Listing ===========');
      if (args.length != 6) {
        throw new Error('Incorrect number of arguments. Expecting 6');
      }

      var vehicleListing = {
        reservePrice: args[1],
        description: args[2],
        listingState: args[3],
        offers: null,
        vehicle: args[4]
      };

      await ctx.stub.putState(args[0], Buffer.from(JSON.stringify(vehicleListing)));
      console.info('============= END : Create Listing ===========');
    }

      /**
       * Create a member object in the state
       * @param arg[0] - key for the member (email)
       * @param arg[1] - first name of member
       * @param arg[2] - last name of member
       * @param arg[3] - balance: amount of money in member's account
       * onSuccess - create and update the state with a new member  object
       */
      async createMember(ctx, args) {
        console.info('============= START : Create Member ===========');
        if (args.length != 4) {
          throw new Error('Incorrect number of arguments. Expecting 4');
        }

        var member = {
          firstName: args[1],
          lastName: args[2],
          balance: args[3]
        };

        console.info(member);

        await ctx.stub.putState(args[0], Buffer.from(JSON.stringify(member)));
        console.info('============= END : Create Member ===========');
      }

    /**
     * Query the state of the blockchain by passing in a key
     * @param arg[0] - key to query
     * @return value of the key if it exists, else return an error
     */
    async queryLot(ctx, args) {
      console.info('============= START : Query method ===========');
      if (args.length != 1) {
        throw new Error('Incorrect number of arguments. Expecting 1');
      }

      let queryAsBytes = await ctx.stub.getState(args[0]); //get the car from chaincode state
      if (!queryAsBytes || queryAsBytes.toString().length <= 0) {
        throw new Error('key' + ' does not exist: ');
      }
      console.info('query response: ');
      console.info(queryAsBytes.toString());
      console.info('============= END : Query method ===========');

      return queryAsBytes;
    }

    /**
     * Query the state of the blockchain by passing in a key
     * @param arg[0] - key to query
     * @return value of the key if it exists, else return an error
     */
    async queryMember(ctx, args) {
      console.log(args.length)
      console.log(args)
      console.info('============= START : Query method ===========');
      if (args.length != 1) {
        throw new Error('Incorrect number of arguments. Expecting 1');
      }

      let queryAsBytes = await ctx.stub.getState(args[0]); //get the car from chaincode state
      if (!queryAsBytes || queryAsBytes.toString().length <= 0) {
        throw new Error('key' + ' does not exist: ');
      }
      console.info('query response: ');
      console.info(queryAsBytes.toString());
      console.info('============= END : Query method ===========');

      return queryAsBytes;
    }

    /**
     * Query the state of the blockchain
     * @return value of the state of the blockchain
     */
    async queryAllLots(ctx) {
      console.info('============= START : Query method ===========');
      if (args.length != 1) {
        throw new Error('Incorrect number of arguments. Expecting 0');
      }
      const startLot = 'LOT0';
      const endLot = 'LOT999';

      const lotIterator = await ctx.stub.getStateByRange(startLot, endLot);

      const allResults = [];
      while (true) {
        const res = await lotIterator.next();

        if (res.value && res.value.value.toString()) {
          console.log(res.value.value.toString('utf8'));

          const Key = res.value.key;
          let Record;
          try {
            Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            Record = res.value.value.toString('utf8');
          }
          allResults.push({ Key, Record });
        }
        if (res.done) {
          await lotIterator.close();
          break;
        }
      }

      const startMem = 'MEM0';
      const endMem = 'MEM999';

      const memIterator = await ctx.stub.getStateByRange(startMem, endMem);

      while (true) {
        const res = await memIterator.next();

        if (res.value && res.value.value.toString()) {
          console.log(res.value.value.toString('utf8'));

          const Key = res.value.key;
          let Record;
          try {
            Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            Record = res.value.value.toString('utf8');
          }
          allResults.push({ Key, Record });
        }
        if (res.done) {
          await memIterator.close();
          break;
        }
      }
      console.log('end of data');
      console.info(allResults);
      console.info('============= END : Query method ===========');

      return JSON.stringify(allResults);
    }

    /**
     * Create a offer object in the state, and add it to the array of offers for that listing
     * @param arg[0] - bid price in the offer - how much bidder is willing to pay
     * @param arg[1] - listing number: reference to a listing in the state
     * @param arg[2] - member email: reference to member which does not own vehicle
     * onSuccess - create and update the state with a new offer object
     */
    async makeOffer(ctx, args) {
      console.info('============= START : Make Offer ===========');
      if (args.length != 3) {
        throw new Error('Incorrect number of arguments. Expecting 3');
      }

      var offer = {
        bidPrice: args[0],
        listing: args[1],
        member: args[2]
      };

      let listing = args[1];
      console.info('listing: ' + listing);

      //get reference to listing, to add the offer to the listing later
      let listingAsBytes = await ctx.stub.getState(listing);
      if (!listingAsBytes || listingAsBytes.toString().length <= 0) {
        throw new Error('listing does not exist');
      }
      listing = JSON.parse(listingAsBytes);

      //get reference to vehicle, to update it's owner later
      let vehicleAsBytes = await ctx.stub.getState(listing.vehicle);
      if (!vehicleAsBytes || vehicleAsBytes.toString().length <= 0) {
        throw new Error('item does not exist');
      }

      let vehicle = JSON.parse(vehicleAsBytes);

      //get reference to member to ensure enough balance in their account to make the bid
      let memberAsBytes = await ctx.stub.getState(offer.member);
      if (!memberAsBytes || memberAsBytes.toString().length <= 0) {
        throw new Error('member does not exist');
      }
      let member = JSON.parse(memberAsBytes);

      //check to ensure bidder has enough balance to make the bid
      if (member.balance < offer.bidPrice) {
        throw new Error('The bid is higher than the balance in your account!');
      }

      console.info('item: ');
      console.info(util.inspect(vehicle, { showHidden: false, depth: null }));
      console.info('offer: ');
      console.info(util.inspect(offer, { showHidden: false, depth: null }));


      //check to ensure bidder can't bid on own item!
      if (vehicle.owner == offer.member) {
        throw new Error('owner cannot bid on own item: ');
      }

      console.info('listing response before pushing to offers: ');
      console.info(listing);
      if (!listing.offers) {
        console.info('there are no offers! ');
        listing.offers = [];
      }
      listing.offers.push(offer);

      console.info('listing response after pushing to offers: ');
      console.info(listing);
      await ctx.stub.putState(args[1], Buffer.from(JSON.stringify(listing)));

      console.info('============= END : Make Offer ===========');

    }
    /** closeBidding
     * Close the bidding for a vehicle listing and choose the
     * highest bid as the winner.
     * @param arg[0] - listingId - a reference to our vehicleListing
     * onSuccess - changes the ownership of the car on the auction from the original
     * owner to the highest bidder. Subtracts the bid price from the highest bidder
     * and credits the account of the seller. Updates the state to include the new
     * owner and the resulting balances.
     */
    async closeBidding(ctx, args) {
      console.info('============= START : Close bidding ===========');
      if (args.length != 1) {
        throw new Error('Incorrect number of arguments. Expecting 1');
      }

      let listingKey = args[0];

      //check if listing exists
      let listingAsBytes = await ctx.stub.getState(listingKey);
      if (!listingAsBytes || listingAsBytes.toString().length <= 0) {
        throw new Error('listing does not exist: ');
      }
      console.info('============= listing exists ===========');


      var listing = JSON.parse(listingAsBytes);
      console.info('listing: ');
      console.info(util.inspect(listing, { showHidden: false, depth: null }));
      listing.listingState = 'RESERVE_NOT_MET';
      let highestOffer = null;

      //can only close bidding if there are offers
      if (listing.offers && listing.offers.length > 0) {
        listing.offers.sort(function (a, b) {
          return (b.bidPrice - a.bidPrice);
        });

        highestOffer = listing.offers[0];
        console.info('highest Offer: ' + highestOffer);

        //bid must be higher than reserve price, otherwise we can sell the car
        if (highestOffer.bidPrice >= listing.reservePrice) {
          let buyer = highestOffer.member;

          console.info('highestOffer.member: ' + buyer);

          //get the buyer or highest bidder on the vehicle
          let buyerAsBytes = await ctx.stub.getState(buyer);
          if (!buyerAsBytes || buyerAsBytes.toString().length <= 0) {
            throw new Error('buyer does not exist in network');
          }

          buyer = JSON.parse(buyerAsBytes);
          console.info('buyer: ');
          console.info(util.inspect(buyer, { showHidden: false, depth: null }));


          //get reference to vehicle
          let vehicleAsBytes = await ctx.stub.getState(listing.vehicle);
          if (!vehicleAsBytes || vehicleAsBytes.toString().length <= 0) {
            throw new Error('item does not exist');
          }

          var vehicle = JSON.parse(vehicleAsBytes);
          //get reference to the seller - or owner of vehicle
          let sellerAsBytes = await ctx.stub.getState(vehicle.owner);
          if (!sellerAsBytes || sellerAsBytes.toString().length <= 0) {
            throw new Error('Seller does not exist in network');
          }

          let seller = JSON.parse(sellerAsBytes);

          console.info('seller: ');
          console.info(util.inspect(seller, { showHidden: false, depth: null }));

          console.info('#### seller balance before: ' + seller.balance);
          console.info('#### buyer balance before: ' + buyerBalance);
          //ensure all strings get converted to ints
          let sellerBalance = parseInt(seller.balance, 10);
          let highOfferBidPrice = parseInt(highestOffer.bidPrice, 10);
          let buyerBalance = parseInt(buyer.balance, 10);

          sellerBalance += highOfferBidPrice;
          seller.balance = sellerBalance;
          buyerBalance -= highestOffer.bidPrice;
          buyer.balance = buyerBalance;
          let oldOwner = vehicle.owner;
          vehicle.owner = highestOffer.member;

          console.info('#### seller balance after: ' + seller.balance);
          console.info('#### buyer balance after: ' + buyerBalance);
          console.info('#### vehicle owner before: ' + vehicle.owner);
          console.info('#### vehicle owner after: ' + vehicle.owner);
          console.info('#### buyer balance after: ' + buyerBalance);
          listing.offers = null;
          listing.listingState = 'SOLD';

          //update the balance of the buyer
          await ctx.stub.putState(highestOffer.member, Buffer.from(JSON.stringify(buyer)));
          //update the balance of the seller
          await ctx.stub.putState(oldOwner, Buffer.from(JSON.stringify(seller)));
          // update the listing
          await ctx.stub.putState(listingKey, Buffer.from(JSON.stringify(listing)));
        }
      }
      console.info('inspecting item: ');
      console.info(util.inspect(vehicle, { showHidden: false, depth: null }));

      if (highestOffer) {
        //update the owner of the vehicle
        await ctx.stub.putState(listing.vehicle, Buffer.from(JSON.stringify(vehicle)));
      } else { throw new Error('offers do not exist: '); }

      console.info('============= END : closeBidding ===========');
    }
}

module.exports = FabCar;
