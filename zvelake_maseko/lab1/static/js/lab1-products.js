


let products_db = [
    {
        "id": "",
        "name": "Envidia Graphics Card",
        "description": "Видеокарта Palit GeForce RTX 5060 Dual [NE75060019P1-GB2063D] [PCIe 5.0, GPU 2280 МГц, 8 ГБ GDDR7, 128 бит, 3 x DisplayPort, HDMI]",
        "price": "",
        "specs": "",
        "image_url": "https://spb-basket-cdn-09.geobasket.ru/vol5396/part539676/539676174/images/big/1.webp",
        "product_images": []
    },
    {
        "id": "",
        "name": "Envidia Graphics Card",
        "description": "Видеокарта Palit GeForce RTX 5060 Dual [NE75060019P1-GB2063D] [PCIe 5.0, GPU 2280 МГц, 8 ГБ GDDR7, 128 бит, 3 x DisplayPort, HDMI]",
        "price": "",
        "specs": "",
        "image_url": "https://spb-basket-cdn-06.geobasket.ru/vol1351/part135163/135163551/images/big/3.webp",
        "product_images": []
    },
    {
        "id": "",
        "name": "Envidia Graphics Card",
        "description": "Видеокарта Palit GeForce RTX 5060 Dual [NE75060019P1-GB2063D] [PCIe 5.0, GPU 2280 МГц, 8 ГБ GDDR7, 128 бит, 3 x DisplayPort, HDMI]",
        "price": "",
        "specs": "",
        "image_url": "https://spb-static-cdn-06.geobasket.ru/vol1/crm-bnrs/bners1/brandzones/18072/2_8054a7c9-037f-48cc-b092-5071ae3904b2.webp",
        "product_images": []
    },
    
]

class Product{
    constructor(id, name, description, price, image_url){
        this._id = id;
        this._name = name;
        this._description = description;
        this._price = price;
        this._image_url = image_url;
        this._element = this.#createElement();
    }

    #createElement(){
        let d = document.createElement('div',{
            class: ''
        });
        d.className = 'product-card';
        d.innerHTML = `<div class="product-image">
            <img src="${this._image_url}" />
        </div>
        <div class="product-card__body">
            <div class="product-name">
                <p>${this._name}</p>
            </div>
            <div class="product-description">
                <p>${this._description}</p>
            </div>
            
        </div>
        <div class="product-card__footer">
            <div class="product-price">
                <span class="currency-sign">$</span><span class="price">${this._price}</span>
            </div>
        </div>`;
        return d;
    }
    render(){
        document.querySelector('.products-grid').appendChild(this._element);
    }
}

function randomValueGenerator(min, max){
    return Math.floor(min + (Math.random() * (max - min)));
}
let products = products_db.map(p => new Product(randomValueGenerator(2345, 5432), p.name, p.description, randomValueGenerator(10455, 30956), p.image_url));
document.addEventListener('DOMContentLoaded', ()=>{
    let pGrid = document.createElement('div');
    pGrid.className = 'products-grid';
    document.getElementById('root').appendChild(pGrid);
    
    products.forEach(p => p.render());
});
