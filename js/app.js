// 1. 자판기에 음료수 진열하기
// 2. 입금, 반환 기능
// 3. 음료 선택
// 4. 획득

const $vendingMachine = document.querySelector(".vending-machine");
const $listItem = $vendingMachine.querySelector(".list-item");
const $myInfo = document.querySelector(".my-info");
const $myMoney = document.querySelector(".txt-mymoney");
const $btnInsert = $vendingMachine.querySelector(".btn-insert");
const $balance = $vendingMachine.querySelector(".txt-balance");
const $inpInsert = $vendingMachine.querySelector("#inpInsert");
const $btnReturn = $vendingMachine.querySelector(".btn-return");

class Builder {
    constructor() {
        this.balance = 0;
    }

    async setup() {
        await this.loadData(json => {
            this.displayCola(json);
        });

        $btnInsert.addEventListener("click", this.takeMoney.bind(this));
        $btnReturn.addEventListener("click", this.returnMoney.bind(this));
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

    updateBalance() {
        $balance.textContent = `${addComma(this.balance)} 원`;
    }

    takeMoney() {
        this.balance += parseInt($inpInsert.value);
        this.updateBalance();
        $inpInsert.value = null;
    }

    returnMoney() {
        this.balance = 0;
        this.updateBalance();
    }
}

class Person {
    constructor(seedMoney) {
        this.myMoney = seedMoney;
    }

    ready() {
        this.updateMoney();

        $btnInsert.addEventListener("click", this.insertMoney.bind(this)); //주의
        $btnReturn.addEventListener("click", this.takeChange.bind(this)); //주의
    }

    insertMoney() {
        this.myMoney -= parseInt($inpInsert.value);
        this.updateMoney();
    }

    updateMoney() {
        $myMoney.textContent = `${addComma(this.myMoney)} 원`;
    }

    takeChange() {
        this.myMoney += parseInt(deleteComma($balance.textContent)); // builder의 balance로 바꿀 수 있을까?
        this.updateMoney();
    }
}

function addComma(num) {
    return num
        .toString()
        .split("")
        .reverse()
        .map((value, index) =>
            index % 3 === 0 && index !== 0 ? value + "," : value
        )
        .reverse()
        .join("");
}

function deleteComma(str) {
    return str.split(",").join("");
}

const machine = new Builder();
machine.setup();

const person = new Person(25000);
person.ready();
