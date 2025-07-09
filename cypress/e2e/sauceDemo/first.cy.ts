import { forEach } from "cypress/types/lodash";
import { ILoginPage } from "./helper/ILoginPage";
import {
  checkoutFormFirstName,
  checkoutFormLastName,
  checkoutFormPostalCode,
  checkoutInfoWrapper,
  inventoryItem,
  inventoryItemDescCheck,
  inventoryItemName,
  inventoryItemNameCheck,
  inventoryItemPrice,
  inventoryItemPriceCheck,
  pageUrl_inventory,
  shoppingCartLink,
} from "./helper/element.extends";

describe("template spec", () => {
  it("Login into page", () => {
    //init login page for next steps
    const loginPage = new ILoginPage("standard_user", "secret_sauce");
    loginPage.visitLoginPage();

    loginPage.getUserNames().then((resUsers) => {
      Cypress.env("usernames", resUsers);
    });

    loginPage.performLogin();
  });

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

  it("should block access to inventory page when not logged in", () => {
    cy.visit(pageUrl_inventory, {
      failOnStatusCode: false,
    });
    cy.get('[data-test="error"]').should(
      "contain.text",
      "Epic sadface: You can only access '/inventory.html' when you are logged in."
    );
  });

  it.only("Make order as standert user", () => {
    const loginPage = new ILoginPage("standard_user", "secret_sauce");
    loginPage.visitLoginPage();

    loginPage.performLogin();

    cy.get(inventoryItem).first().as("firstProduct");

    cy.get("@firstProduct").within(() => {
      cy.get(inventoryItemName)
        .invoke("text")
        .then((text) => {
          cy.wrap(text).as("productName");
        });

      cy.get(inventoryItemPrice)
        .invoke("text")
        .then((text) => {
          cy.wrap(text).as("productPrice");
        });

      cy.get(".inventory_item_desc")
        .invoke("text")
        .then((text) => {
          cy.wrap(text).as("productDescription");
        });

      cy.get(inventoryItemName)
        .should("be.visible")
        .then(($name) => {
          const productName = $name.text();
          cy.log("Názov produktu:", productName);
        });

      //click na objednat
      cy.contains("button", "Add to cart")
        .click()
        .then(() => {
          cy.wait(1000);
          //click for add order
          loginPage.clickJquery(shoppingCartLink);
        });
    });

    cy.get("@productName").then((name) => {
      cy.get(inventoryItemNameCheck).should("have.text", name);
    });

    cy.get("@productDescription").then((descr) => {
      cy.get(inventoryItemDescCheck).should("have.text", descr);
    });

    cy.get("@productPrice").then((price) => {
      cy.get(inventoryItemPriceCheck).should("have.text", price);
    });

    cy.contains("button", "Checkout").click();

    cy.get(checkoutInfoWrapper).within(() => {
      cy.get(checkoutFormFirstName).type("Peter");
      cy.get(checkoutFormLastName).type("Novak");
      cy.get(checkoutFormPostalCode).type("12345");
    });

    cy.get('[name="continue"]').click();

    //check description again
    cy.get('[class="summary_info"]').within(() => {
      cy.get("@productPrice").then((price) => {
        cy.get('[class="summary_subtotal_label"]').should(
          "have.text",
          "Item total: " + price
        );
      });
    });

    cy.contains("button", "Finish").click();

    cy.contains("button", "Back Home").click();

    loginPage.logOutFromApp();
  });
});
