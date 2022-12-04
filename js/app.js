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

        $btnInsert.addEventListener("moneyinserted", e => {
            this.takeMoney(e);
        });
        // dispatchEvent 메서드는 이벤트 핸들러를 동기 처리 방식으로 처리한다. 따라서 dispatch 전에 이벤트 핸들러가 등록되어있어야 한다. 여기서는 만족하는듯 하다. (정리 필요)
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

    takeMoney(event) {
        // 문제 발생! 클래스를 두 개로 나누다보니 버튼에 달린 이벤트 실행 순서가 뒤죽박죽이어서 제대로 동작하지 않는 문제 발생. 또한 예외처리를 두 클래스에서 모두 해줘야한다는 단점도 있음. 따라서 조금 더 상호작용을 흉내내기 위해 사용자가 돈을 성공적으로 입금한 후(== 소지금의 변화가 생길 경우, 혹은 유니크한 사용자 정의 이벤트) 자판기의 이벤트를 발생시키도록 수정하겠음.
        console.log(event.detail.amount);
        this.balance += parseInt(event.detail.amount);
        this.updateBalance();
        $inpInsert.value = null;

        // console.log("소지금: " + parseInt(deleteComma($myMoney.textContent)));
        // const insertedMoney = parseInt($inpInsert.value);
        // if (insertedMoney) {
        //     if (
        //         insertedMoney <= parseInt(deleteComma($myMoney.textContent)) &&
        //         insertedMoney > 0
        //     ) {
        //         this.balance += parseInt($inpInsert.value);
        //         this.updateBalance();
        //     } else {
        //         alert("문제 발생!");
        //         $inpInsert.value = null;
        //         return;
        //     }
        //     $inpInsert.value = null;
        // }
    }

    returnMoney() {
        const spitMoney = new CustomEvent("moneyspit", {
            detail: { amount: this.balance },
        });
        $btnReturn.dispatchEvent(spitMoney);
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

        $btnInsert.addEventListener("click", () => {
            this.insertMoney();
        }); //주의
        $btnReturn.addEventListener("moneyspit", e => {
            this.takeChange(e);
        }); //주의
    }

    insertMoney() {
        const insertedMoney = parseInt($inpInsert.value);

        if (insertedMoney) {
            if (insertedMoney <= this.myMoney && insertedMoney > 0) {
                const moneyInserted = new CustomEvent("moneyinserted", {
                    detail: { amount: insertedMoney },
                });
                this.myMoney -= parseInt($inpInsert.value);
                this.updateMoney();
                $btnInsert.dispatchEvent(moneyInserted);
            } else {
                alert("소지금이 부족합니다.");
                $inpInsert.value = null;
            }
        }
    }

    updateMoney() {
        $myMoney.textContent = `${addComma(this.myMoney)} 원`;
    }

    takeChange(event) {
        this.myMoney += event.detail.amount; // builder의 balance로 바꿀 수 있을까?
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
