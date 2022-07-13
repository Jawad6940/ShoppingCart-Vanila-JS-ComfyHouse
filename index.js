// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCart = document.querySelector(".close-cart");
const clearCart = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const cartTotal = document.querySelector(".cart-total");
const productDom = document.querySelector(".product-container");

//cart array

let cart = [];

//button array
let btnDom=[];

//getting product

class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      // return data;
      let products = data.items;

      products = products.map((item) => {
        // console.log(item)
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log("error", error);
    }
  }
}

//display product

class UI {
  displayProduct(product) {
    // console.log(product)
    // create a variable to store the details
    let result = "";

    product.forEach((item) => {
      // console.log(item)

      result += `<div class="col-md-4 col-lg-3">
        <div class="img-container">

          <img src="${item.image}" alt="product-1" class="img-fluid rounded">
          <button class=" bag-btn " data-id="${item.id}">
           <i class="fa fa-cart-plus" aria-hidden="true"></i>  add to bag
          </button>
        </div>
        <h3>${item.title}</h3>
        <h4>$${item.price}</h4>
      </div>`;
    });
    // console.log(result)
    // add the details into html below the product section
    productDom.innerHTML = result;
  }

  //to add into cart
  getButtons() {
    //creat a array of all btns (add to cart btn)
    const buttons = [...document.querySelectorAll(".bag-btn")];
    // add all button to btn array
    btnDom=buttons
    // console.log(buttons);
    //iterate through each btn
    buttons.forEach((i) => {
      //extract the id of each item
      let id = i.dataset.id;
      //    console.log(id);
      //check if the item already in cart
      let inCart = cart.find((item) => item.id === id);

      //if incart keep as it as
      if(inCart){
          i.textContent="In Cart";
          i.disabled=true;
          // console.log(inCart);
      }
      //else we will add to cart and make the visibilty disabled and change name to in cart

      i.addEventListener("click", (event) => {
        // console.log(event);
        //change btn name
        event.target.textContent = "In cart";
        //disble
        event.target.disabled = true;

        //get product from products
        //extract all details about the product based on id also add initial amount
        let cartItem={...Storage.getProduct(id),amount:1};
        //add product into cart array both existing and new
        cart=[...cart,cartItem];
        // store the new cart in local storage
        Storage.saveCart(cart);
        // calculate total expense according to cart item
        this.setCartValue(cart);
        // add the cart product to cart window and make it visible in page
        this.addToCart(cartItem);
        // this.showCart()
        
    });
    });
  }

  setCartValue(cart){
    // calculate price
    let price=0;
    // number of items
    let itemTot=0;
    // map through all item
    cart.map(item=>{

        price+=(item.price)*(item.amount);
        itemTot+=(item.amount)
    })
    // updated the value into html
    cartTotal.textContent= parseFloat(price.toFixed(2))
    cartItems.textContent=itemTot;
    // console.log(cartTotal);
  }
  addToCart(item){
    // create a div 
    const div= document.createElement("div");
    // add class for the tag
    div.classList.add("cart-item","row","my-4")
    // create innerhtml contenet
    div.innerHTML=`
    
    <div class="col-4">
    <img src="${item.image} " class="img-fluid " alt="product">
  </div>
 
  <div class="col-6">
    <h4>${item.title}</h4>
    <h5>$${item.price}</h5>
    <!--we will add data id to manupulate price value-->
    <span class="remove-item text-muted" data-id="${item.id}">Remove</span>
  </div>
  <div class="col-2 d-flex flex-column align-items-center justify-content-center">
    <i class="fa fa-chevron-up fs-4 " data-id="${item.id}" aria-hidden="true"></i>
    <p class="item-amount mb-1 fs-4">${item.amount}</p>
    <i class="fa fa-chevron-down fs-4" data-id="${item.id}" aria-hidden="true"></i>
  </div>`
  // append the div as child of cart conntend
  cartContent.appendChild(div);
  // console.log(cartContent);

  }
  // to make visible the cart
  showCart(){
    cartOverlay.classList.add("showCart")
    cartDom.classList.add("transform")
  }
  // to store the previous details
  setupApp(){
    cart=Storage.getCart()
    // console.log(cart);
    this.setCartValue(cart)
    this.populate(cart);
    cartBtn.addEventListener("click",this.showCart)
    closeCart.addEventListener("click",this.hideCart)
  }
  populate(cart){
    cart.forEach(item=>{
      this.addToCart(item);
    })
  }
  hideCart(){
    cartOverlay.classList.remove("showCart")
    cartDom.classList.remove("transform")
  }
  // to acces the cart btns and parameters
  cartLogic(){
    //clear button setup
    clearCart.addEventListener("click",()=>{
      this.clearCart();
    })
    //remove, up and down 
    cartContent.addEventListener("click",event=>{
      if(event.target.classList.contains("remove-item")){
        let removeItem= event.target;
        let id =removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement)
        this.removeId(id);
      }
      else if(event.target.classList.contains("fa-chevron-up")){
        let addAmount= event.target;
        let id =addAmount.dataset.id;
        let temp= cart.find(item=>item.id===id)
        temp.amount++;
        Storage.saveCart(cart)
        this.setCartValue(cart);
        addAmount.nextElementSibling.textContent=temp.amount;
        // console.log(temp.amount);
      }
      else if(event.target.classList.contains("fa-chevron-down")){
        let decreaseAmount= event.target;
        let id =decreaseAmount.dataset.id;
        let temp= cart.find(item=>item.id===id)
        temp.amount--;
        if( temp.amount<0){
          temp.amount=0;
        }
        Storage.saveCart(cart)
        this.setCartValue(cart);
        decreaseAmount.previousElementSibling.textContent=temp.amount;
        // console.log(temp.amount);
      }
    })
  }
  clearCart(){
    let cartItems = cart.map(item => item.id);
    // console.log(cartItems);
    cartItems.forEach(id=> this.removeId(id))
    while(cartContent.children.length>0){
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart()
  }
  // to filter the cart based on id
  removeId(id){
    console.log(cart);
    cart=cart.filter(val => val.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart)
    let btn= this.getSingleBtn(id);
    btn.disabled=false
    btn.innerHTML=`<i class="fa fa-cart-plus" aria-hidden="true"></i>  add to bag`
  }
  getSingleBtn(id){
    return btnDom.find(btn=> btn.dataset.id===id);
  }
}
class Storage {
  static storeProduct(product) {
    localStorage.setItem("Product", JSON.stringify(product));
  }
 static getProduct(id){
    let products=JSON.parse(localStorage.getItem("Product"))
    return products.find(item=>item.id===id);
  }
  static saveCart(cart){
    localStorage.setItem("Cart",JSON.stringify(cart))
  }
  static getCart(){
    return localStorage.getItem("Cart") ? JSON.parse(localStorage.getItem("Cart")):[];
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  //setup app
  ui.setupApp();
  //get product

  products
    .getProducts()
    .then((data) => {
      ui.displayProduct(data);
      Storage.storeProduct(data);
    })
    .then(() => {
      ui.getButtons();
      ui.cartLogic();
    });
});
