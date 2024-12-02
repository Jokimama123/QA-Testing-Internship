import { test, expect } from "@playwright/test";
//Importing all the helper function
import {
  login,
  signUp,
  addItemsToCart,
  deleteItemFromCart,
  deleteMultipleItemsFromCart,
  checkErrorMessage,
  fillAndSubmitPurchaseForm,
  fillAndSubmitContactMessageForm,
  testCategoryItemsFilter,
  userLoggedInCheck,
  checkCartIsEmpty,
  successPurchase,
  getTotalValueOfItems,
} from "./helper"; 

// Before each test, navigate to the main website page
test.beforeEach(async ({ page }) => {
  await page.goto("https://demoblaze.com/index.html");
})

// Group of tests for the Login page functionalities
test.describe("Login Page Test", () => {
  
  // Test for valid login with correct username and password
  test("Login with valid username and password", async ({ page }) => {
    // Fill in login form and submit with valid credentials
    await login(page, "Veljko", "Veljko023!");
    // Check if the user is logged in by verifying the username
    await userLoggedInCheck(page, "Veljko")
  });

  // Test for login attempt with invalid username and password
  test("Login with invalid username and password", async ({ page }) => {
    // Attempt to log in with invalid credentials
    await login(page, "user", "userPass");
    // Check if an error message is displayed for wrong password
    await checkErrorMessage(page, "Wrong password.");
  });

  // Test for login attempt with empty fields (both username and password)
  test("Login with all field empty", async ({ page }) => {
    // Attempt to log in with an empty username and passwor
    await login(page, '', '');
     // Check if an error message prompts to fill out both fields
    await checkErrorMessage(page, "Please fill out Username and Password.");
  });

  // Test for login attempt with an empty password field
  test("Login with password field empty", async ({ page }) => {
    // Attempt to log in with an empty password
    await login(page, 'Veljko', '');
    // Check if an error message prompts to fill out both fields
    await checkErrorMessage(page, "Please fill out Username and Password.");
  });

   // Test for login attempt with an empty email field
  test("Login with email field empty", async ({ page }) => {
    // Attempt to log in with an empty email
    await login(page, '', 'Veljkok023!');
    // Check if an error message prompts to fill out both fields
    await checkErrorMessage(page, "Please fill out Username and Password.");
  });
});

// Group of tests for the Sign-up page functionalities
test.describe("Sign up Page Test", () => {
  // Test for signing up with an already existing user
  test("Sign up with already existing user", async ({ page }) => {
    // Attempt to sign up with an existing username
    await signUp(page, "user", "userPass");
     // Check if the error message indicates the user already exists
    await checkErrorMessage(page, "This user already exist."); 
  });

  // Check if the error message indicates the user already exists
  test("Sign up with valid username and password", async ({ page }) => {
    // Attempt to sign up with a new username and valid password
    await signUp(page, "Veljko3", "Veljko023!");
    // Check if the success message confirms the sign-up
    await checkErrorMessage(page, "Sign up successful.");
  });
  // Test for signing up without an username
  test("Sign up without password", async ({ page }) => {
    // Attempt to sign up with a new username and valid password
    await signUp(page, "Veljko3", "");
    // Check if an error message prompts to fill out both fields
    await checkErrorMessage(page, "Please fill out Username and Password.");
  });
  // Test for signing up without an username
  test("Sign up without email", async ({ page }) => {
    // Attempt to sign up with only a password
    await signUp(page, "", "password");
    // Check if an error message prompts to fill out both fields
    await checkErrorMessage(page, "Please fill out Username and Password.");
  });
});

// Group of tests for the Cart Page functionalities
test.describe("Cart Page Test", () => {

  // Test for adding an item to the cart and then deleting it
  test("Adding Item to Cart and deleting it", async ({ page }) => {
    // Add the "Nexus 6" item to the cart
    const items = ["Nexus 6"]
    await addItemsToCart(page, items);
    // Remove the "Nexus 6" item from the cart
    await deleteItemFromCart(page, "Nexus 6")
  });

  // Test for adding multiple items to the cart and deleting them
  test("Adding Multiple Items to Cart and Deleting them", async ({ page }) => {
    // Add the items to cart
    const items = ["Samsung galaxy s6", "Nokia lumia 1520", "Nexus 6"]
    await addItemsToCart(page, items);
    // Remove the all the items from the cart
    await deleteMultipleItemsFromCart(page, items)
  });

  // Test to check if the cart total value is calculated correctly
  test("Checking to see if the right total apears", async ({ page }) => {
    // Add items to the cart 
    const items = ["Nexus 6", "Nexus 6", "Nexus 6"]
    await addItemsToCart(page, items);
    // Navigate to the Cart page by clicking on the "Cart" link
    await page.locator("li", { hasText: "Cart" }).click();
    // Wait for the page to load the cart and items 
    await page.waitForTimeout(1000)
    // Get the total value of the items in the cart
    await getTotalValueOfItems(page);
  });

  // Test for ordering items with all fields correctly filled out in the purchase form
  test("Ordering an Item with all of the field filled in", async ({ page }) => {
    // Add items to the cart\
    const items = ["Nokia lumia 1520","Nexus 6"]
    await addItemsToCart(page, items);
  
    // Go to the Cart page
    await page.locator("li", { hasText: "Cart" }).click();
  
    // Fill in the purchase form with valid data and submit it
    await fillAndSubmitPurchaseForm(
      page,
      "Veljko",
      "Serbia",
      "Zrenjanin",
      "4000 4000 4000 4000",
      "November",
      "2024"
    );
    // Check if the purchase was successful
    await successPurchase(page)
    // Verify that the cart is empty after the purchase
    await checkCartIsEmpty(page)
  });

  // Test for attempting to order items with missing or invalid form fields
  test("Ordering an Item without any of the field filled in", async ({page}) => {
    // Add items to the cart
    const items = ["Nokia lumia 1520", "Nexus 6"]
    await addItemsToCart(page, items);
    // Go to the Cart page
    await page.locator("li", { hasText: "Cart" }).click();
    // Fill the purchase form with incomplete or invalid data
    await fillAndSubmitPurchaseForm(page,"","","","","","");
     // Attempt to submit the purchase
    await page.getByRole("button", { name: "Purchase" }).click();
    // Verify that an error message is shown indicating the form is incomplete
    await checkErrorMessage(page, "Please fill out Name and Creditcard.");
  });

  // Test for trying to place an order when the cart is empty
  test("Ordering while card is empty", async ({ page }) => {
    // Check that the cart is empty
    await checkCartIsEmpty(page)
    // Locate the "Place Order" button
    const placeOrderButton = page.locator("button.btn.btn-success");
    // Check if the "Place Order" button is disabled when the cart is empty
    const isDisabled = await placeOrderButton.getAttribute('disabled') !== null
    // Assert that the button is indeed disabled
    expect(isDisabled).toBe(true);
  });
});

// Group of tests for the Contact Page functionality
test.describe("Contact Page Test", () => {

  // Test for submitting a contact request form with all fields filled in
  test("Sumbiting a conctact request with all field filled in", async ({page}) => {
    // Fill in the contact form and submit it
    await fillAndSubmitContactMessageForm(page,"test@test.com","test","This is a test message");
    // Check if the success message is displayed
    await checkErrorMessage(page, 'Thanks for the message!!')
  });

  // Test for submitting a contact request form with no fields filled out
  test("Button for sending message is disabled if nothing is filled in", async ({page}) => {
    // Navigate to the contact page
    await page.locator("li", { hasText: "Contact" }).click();
    // Locate the "Send Message" button
    const placeOrderButton = page.getByRole("button", { name: "Send Message" });
    // Check if the "Send Message" button is disabled when no fields are filled
    const isDisabled = await placeOrderButton.getAttribute('disabled') !== null;
    expect(isDisabled).toBe(true); //Ensure the button is disabled
  });
});

// Group of tests for the About Us Page functionality
test.describe("About us Page Test", () => {
  // Test to verify the About Us page works as expected
  test("Checking if the About us Page works", async ({ page }) => {
    // Navigate to the About Us page
    await page.locator("li", { hasText: "About" }).click();
    // Click the Close button on the About Us page
    await page.locator("button.btn.btn-secondary").nth(3).click();
  });
});

// Test to check if navigating back to the home page via the logo works
test("Navigate to home page with pressing the 'Product Store' logo", async ({page}) => {
  // Locate the "Product Store" logo on the page
  const pageLogo = page.locator("a", { hasText: "Product Store" });
  // Ensure the logo has the correct text
  await expect(pageLogo).toHaveText(" PRODUCT STORE");
  // Click the logo to navigate back to the homepage
  await pageLogo.click();
  // Verify that the verify that we are indeed on the home page after clicking the logo
  await expect(page.locator("a", { hasText: "CATEGORIES" })).toHaveText("CATEGORIES");
});

// Group of tests for verifying product categories and their filters
test.describe("Check if each categories shows the correct filter", () => {

  // Test for verifying the Phones category filter
  test("Phones Category", async ({ page }) => {
    const expectedPhones = [
      "Samsung galaxy s6",
      "Nokia lumia 1520",
      "Nexus 6",
      "Samsung galaxy s7",
      "Iphone 6 32gb",
      "Sony xperia z5",
      "HTC One M9",
    ];
    // Verify the phones listed under the "Phones" category
    await testCategoryItemsFilter(page, 'Phones', expectedPhones)
  });

   // Test for verifying the Laptops category filter
  test("Laptop Category", async ({ page }) => {
    const expectedLaptops = [
      "Sony vaio i5",
      "Sony vaio i7",
      "MacBook air",
      "Dell i7 8gb",
      "2017 Dell 15.6 Inch",
      "MacBook Pro",
    ];
    // Verify the laptops listed under the "Laptops" category
    await testCategoryItemsFilter(page, 'Laptops', expectedLaptops)
  });
  
  // Test for verifying the Monitors category filter
  test("Monitor Category", async ({ page }) => {
    const expectedMonitors = [
      "Apple monitor 24",
      "ASUS Full HD"
    ];
    // Verify the monitors listed under the "Monitors" category
    await testCategoryItemsFilter(page, 'Monitors', expectedMonitors);
  });
});

test('Check Everything so far', async ({page}) => {
  await signUp(page, "Velja12", "Veljko023!");
  await login(page, "Velja12", "Veljko023!");
  await userLoggedInCheck(page, "Velja12")
  await fillAndSubmitContactMessageForm(page,"test@test.com","test","This is a test message");
  const items = ["Samsung galaxy s6", "MacBook air", "Nexus 6"]
  await addItemsToCart(page, items);
  await deleteItemFromCart(page, "Nexus 6")
  await page.waitForTimeout(1000)
  await getTotalValueOfItems(page);
  await fillAndSubmitPurchaseForm(
    page,
    "Veljko",
    "Serbia",
    "Zrenjanin",
    "4000 4000 4000 4000",
    "November",
    "2024"
  );
  await successPurchase(page)
  await checkCartIsEmpty(page)
  await page.click('#logout2');
})

test('Previous button is not visible when we are on the home page', async ({page}) => {
  const prevButton = page.locator('button#prev2.page-link')
  const isVisible = await prevButton.isVisible()
  await expect(isVisible).toBeFalsy()
})

test('Next button is visible and pressible', async ({page}) => {
  const nextButton1 = page.locator('button#next2.page-link')
  const isVisible = await nextButton1.isVisible()
  await expect(isVisible).toBeTruthy()
  await page.waitForTimeout(1000)
  await nextButton1.click()

  const prevButton = page.locator('button#prev2.page-link')
  const isVisible2 = await prevButton.isVisible()
  await expect(isVisible2).toBeTruthy()
})

