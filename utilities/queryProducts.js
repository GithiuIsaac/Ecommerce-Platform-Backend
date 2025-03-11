class queryProducts {
  // products = [];
  // query = {};
  // constructor(products, query) {
  //   this.products = products;
  //   this.query = query;
  // }

  constructor(products, query) {
    this.products = products || [];
    this.query = query || {};
  }

  // When a category is selected, filter products based on that category
  categoryQuery = () => {
    // category - DB field in the products table
    // product - Each individual product object in the array
    // this.query.category filters the this.products array and only keeps products where the category matches
    // If this.query.category doesn't exist, it returns the original this.products array unfiltered
    this.products = this.query.category
      ? this.products.filter(
          (product) => product.category === this.query.category
        )
      : this.products;
    return this;
  };

  // When a rating is selected, filter products based on that rating
  ratingQuery = () => {
    // rating - DB field in the products table
    // product - Each individual product object in the array
    // If this.query.rating exists, the product filter is applied
    // If it doesn't, return the original array unmodified
    // The filter creates a rating range for the specified rating, and the next whole number rating
    console.log("Rating query:", this.query.rating);
    console.log("Products before filter:", this.products.length);
    this.products = this.query.rating
      ? this.products.filter(
          (product) =>
            parseInt(this.query.rating) <= product.rating &&
            product.rating < parseInt(this.query.rating) + 1
        )
      : this.products;
    console.log("Products after filter:", this.products.length);
    return this;
  };

  priceQuery = () => {
    // price - DB field in the products table
    // product - Each individual product object in the array
    // The filter creates a price range for the specified min and max price
    // The specified conditions must both be true
    // - product's price must be greater than or equal to lowPrice
    // - AND the product's price must be less than or equal to highPrice
    this.products = this.products.filter(
      (product) =>
        product.price >= parseInt(this.query.lowPrice) &&
        product.price <= parseInt(this.query.highPrice)
    );
    return this;
  };

  sortByPrice = () => {
    // Sort the products array based on price
    // If the query sortPrice exists, check whether low-to-high or high-to-low
    // If a.price is less than b.price, returns negative (a comes before b)
    // If a.price is greater than b.price, returns positive (b comes before a)
    if (this.query.sortPrice) {
      if (this.query.sortPrice === "low-to-high") {
        this.products = this.products.sort((a, b) => a.price - b.price);
      } else if (this.query.sortPrice === "high-to-low") {
        this.products = this.products.sort((a, b) => b.price - a.price);
      }
    }
    return this;
  };

  // Implement pagination logic to skip to a specific page
  skip = () => {
    // Destructure the pageNumber param from the query
    let { pageNumber } = this.query;

    // Calculate how many products to skip:
    // - If pageNumber is 1, and perPage is 12, skip 0 products (0 * 12)
    // - If pageNumber is 3 and perPage is 12: skip 24 products (2 * 12)
    const skipPage = (parseInt(pageNumber) - 1) * this.query.perPage;

    // Create a new array and fill it with products starting from the skip point
    let skipProduct = [];

    for (let i = skipPage; i < this.products.length; i++) {
      skipProduct.push(this.products[i]);
    }

    // Replace the original products array with the new skipped array
    this.products = skipProduct;
    return this;
  };

  // limits the number of products returned based on the perPage value
  limit = () => {
    // Temporary array to store the limited products:
    let tempArray = [];

    // Check if the total number of products is greater than the perPage limit:
    if (this.products.length > this.query.perPage) {
      // If there are more products than the perPage limit:
      // - loops through and takes only the first perPage number of products
      for (let i = 0; i < this.query.perPage; i++) {
        tempArray.push(this.products[i]);
      }
      // If there are fewer products than the perPage limit, return the entire array
    } else {
      tempArray = this.products;
    }

    this.products = tempArray;
    return this;
  };

  // Get all products from the DB
  getProducts = () => {
    return this.products;
  };

  // Display product count
  countProducts = () => {
    return this.products.length;
  };
}

export default queryProducts;
