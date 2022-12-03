// 1. 자판기에 음료수 진열하기
// 2. 입금, 반환 기능
// 3. 음료 선택
// 4. 획득

const $vendingMachine = document.querySelector(".vending-machine");
const $listItem = $vendingMachine.querySelector(".list-item");

class Builder {
    constructor() {}

    setup() {
        this.loadData(json => {
            this.displayCola(json);
        });
    }

    async loadData(callback) {
        const res = await fetch("data/drinks.json");
        if (res.ok) {
            callback(await res.json());
        } else {
            alert("통신 에러!" + res.status);
        }
    }

    displayCola(data) {
        const frag = document.createDocumentFragment();
        data.forEach(item => {
            const li = document.createElement("li");
            const btnItem = document.createElement("button");
            btnItem.classList.add("btn-item");
            btnItem.setAttribute("type", "button");
            const imgItem = document.createElement("img");
            imgItem.classList.add("img-item");
            imgItem.setAttribute("src", `img/${item.img}`);
            imgItem.setAttribute("alt", "");
            const itemName = document.createElement("strong");
            itemName.classList.add("txt-item-name");
            itemName.textContent = item.name;
            const itemPrice = document.createElement("span");
            itemPrice.classList.add("txt-item-price");
            itemPrice.textContent = `${item.price}원`;

            [imgItem, itemName, itemPrice].forEach(v => {
                btnItem.appendChild(v);
            });
            li.appendChild(btnItem);
            frag.appendChild(li);
        });
        $listItem.appendChild(frag);
    }
}

class Person {
    constructor(seedMoney) {
        this.seedMoney = seedMoney;
    }
}

const machine = new Builder();
machine.setup();
