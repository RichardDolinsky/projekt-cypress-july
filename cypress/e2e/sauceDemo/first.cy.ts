import { forEach } from "cypress/types/lodash";
import { ILoginPage } from "./helper/ILoginPage";
import {
  checkoutFormFirstName,
  checkoutFormLastName,
  checkoutFormPostalCode,
  checkoutInfoWrapper,
  inventoryItemSection,
  inventoryItemDescCheck,
  inventoryItemName,
  inventoryItemNameCheck,
  inventoryItemPrice,
  inventoryItemPriceCheck,
  pageUrl_inventory,
  shoppingCartLink,
  inventoryItemDescription,
  invetoryItemsList,
} from "./helper/element.extends";
import { InventoryPage, Product } from "../../types/sauceDemo/product.page";

describe("Sauce-Demo test describe-1", () => {
  /**
   * TEST CASE 1:
   * Log in as a single user without logging out.
   * Assert that the inventory content is visible after login.
   */
  it("Login into page", () => {
    //init login page for next steps
    const loginPage = new ILoginPage("standard_user", "secret_sauce");
    loginPage.visitLoginPage();

    loginPage.getUserNames().then((resUsers) => {
      Cypress.env("usernames", resUsers);
    });

    loginPage.performLogin();
    cy.get(invetoryItemsList).should("be.visible");
  });

  /**
   * TEST CASE 2:
   * Log in with all users except the locked-out user.
   * The locked-out user should trigger an assertion for the access denied page.
   * All other users should trigger assertions for visible inventory content.
   */
  it("Login into page with all users", () => {
    const allUsers: string[] = Cypress.env("usernames");

    allUsers.forEach((userName) => {
      if (userName === "locked_out_user") {
      } else {
        const loginPage = new ILoginPage(userName, "secret_sauce");
        loginPage.visitLoginPage();
        loginPage.performLogin();
        cy.url().should("eq", pageUrl_inventory);
        cy.get('[data-test="title"]')
          .should("be.visible")
          .and("have.text", "Products");
      }
    });
  });

  /**
   * TEST CASE 3:
   * Visit the page by forcing a URL redirect to the inventory page.
   * This test verifies that the user is already logged in before accessing the shop's ordering content.
   */
  it("Should block access to inventory page when not logged in", () => {
    cy.visit(pageUrl_inventory, {
      failOnStatusCode: false,
    });
    cy.get('[data-test="error"]').should(
      "contain.text",
      "Epic sadface: You can only access '/inventory.html' when you are logged in."
    );
  });

  /**
   * Test case 4: Place an order as a happy path user.
   * Throughout this process, the user will check the summary information of the selected product.
   * At the end, the user confirms the order, completes the registration, and logs out from the page.
   */
  it("Make order as standart user", () => {
    const loginPage = new ILoginPage("standard_user", "secret_sauce");
    loginPage.visitLoginPage();

    loginPage.performLogin();

    const products: Product[] = [];
    const inventoryPage = new InventoryPage(products);

    //Select first item and save its values
    inventoryPage.selectInventoryItem(
      0,
      inventoryItemSection,
      inventoryItemName,
      inventoryItemPrice,
      inventoryItemDescription
    );

    cy.then(() => {
      loginPage.clickJquery(shoppingCartLink);
    });

    cy.then(() => {
      cy.contains(inventoryItemNameCheck, products[0].name).should("exist");
      cy.contains(inventoryItemPriceCheck, products[0].price).should("exist");
      cy.contains(inventoryItemDescCheck, products[0].desc).should("exist");
    });

    cy.contains("button", "Checkout").click();

    cy.get(checkoutInfoWrapper).within(() => {
      cy.get(checkoutFormFirstName).type("Peter");
      cy.get(checkoutFormLastName).type("Novak");
      cy.get(checkoutFormPostalCode).type("12345");
    });

    cy.get('[name="continue"]').click();

    //check summary
    inventoryPage.checkSummaryOfItems(products);

    //move into logout page
    cy.contains("button", "Finish").click();
    cy.contains("button", "Back Home").click();
    loginPage.logOutFromApp();
  });

  it("Make order as standard user with 2 items", () => {
    const loginPage = new ILoginPage("standard_user", "secret_sauce");
    loginPage.visitLoginPage();
    loginPage.performLogin();
    const products: Product[] = [];
    const inventoryPage = new InventoryPage(products);

    //Select first item and save its values
    inventoryPage.selectInventoryItem(
      0,
      inventoryItemSection,
      inventoryItemName,
      inventoryItemPrice,
      inventoryItemDescription
    );

    //Select second item and save its values
    inventoryPage.selectInventoryItem(
      1,
      inventoryItemSection,
      inventoryItemName,
      inventoryItemPrice,
      inventoryItemDescription
    );

    cy.wait(500);
    loginPage.clickJquery(shoppingCartLink);

    // Check validity of items in cart
    cy.then(() => {
      products.forEach((product) => {
        cy.log(`Check validity of items in cart: ${product.name}`);
        cy.contains(inventoryItemNameCheck, product.name).should("exist");
        cy.contains(inventoryItemPriceCheck, product.price).should("exist");
        cy.contains(inventoryItemDescCheck, product.desc).should("exist");
      });
    });

    // Continue in order
    cy.contains("button", "Checkout").click();

    cy.get(checkoutInfoWrapper).within(() => {
      cy.get(checkoutFormFirstName).type("Peter");
      cy.get(checkoutFormLastName).type("Novak");
      cy.get(checkoutFormPostalCode).type("12345");
    });

    cy.get('[name="continue"]').click();

    //Check summarization of items in cart
    inventoryPage.checkSummaryOfItems(products);
    cy.contains("button", "Finish").click();
    cy.contains("button", "Back Home").click();
    loginPage.logOutFromApp();
  });

  //make orders and remove one

  /**
   * Test case 5: Make an order as a standard user with multiple products.
   * Then, one product will be deleted from the order.
   * Throughout this process, the user checks the summary. At the end, the user logs out.
   */
  it("Make order as standard user with 3 items and remove one", () => {
    const loginPage = new ILoginPage("standard_user", "secret_sauce");
    loginPage.visitLoginPage();
    loginPage.performLogin();
    const products: Product[] = [];
    const inventoryPage = new InventoryPage(products);

    //Select first item and save its values
    inventoryPage.selectInventoryItem(
      0,
      inventoryItemSection,
      inventoryItemName,
      inventoryItemPrice,
      inventoryItemDescription
    );

    //Select second item and save its values
    inventoryPage.selectInventoryItem(
      1,
      inventoryItemSection,
      inventoryItemName,
      inventoryItemPrice,
      inventoryItemDescription
    );

    inventoryPage.selectInventoryItem(
      2,
      inventoryItemSection,
      inventoryItemName,
      inventoryItemPrice,
      inventoryItemDescription
    );

    cy.wait(500);
    loginPage.clickJquery(shoppingCartLink);

    // Check validity of items in cart
    cy.then(() => {
      products.forEach((product) => {
        cy.log(`Check validity of items in cart: ${product.name}`);
        cy.contains(inventoryItemNameCheck, product.name).should("exist");
        cy.contains(inventoryItemPriceCheck, product.price).should("exist");
        cy.contains(inventoryItemDescCheck, product.desc).should("exist");
      });
    });
    //remove item

    cy.then(() => {
      inventoryPage.removeItemFromCart(products[2]);
      products.splice(2, 2);
    });

    // Continue in order
    cy.contains("button", "Checkout").click();

    cy.get(checkoutInfoWrapper).within(() => {
      cy.get(checkoutFormFirstName).type("Peter");
      cy.get(checkoutFormLastName).type("Novak");
      cy.get(checkoutFormPostalCode).type("12345");
    });

    cy.get('[name="continue"]').click();

    //Check summarization of items in cart
    inventoryPage.checkSummaryOfItems(products);
    cy.contains("button", "Finish").click();
    cy.contains("button", "Back Home").click();
    loginPage.logOutFromApp();
  });
});
