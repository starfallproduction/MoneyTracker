import {
  atom,
  selector, 
  useRecoilValue,
  useSetRecoilState
} from 'recoil';

import { Money } from "../models/Money";

// money state

const money = atom<Money[]>({
  key: 'moneyAtom',
  default: [
    {date: "11/02/2019", value: 50000, type: "increase"},
    {date: "21/04/2021", value: 45000, type: "decrease"},
    {date: "01/08/2020", value: 10000, type: "increase"},
    {date: "20/08/2020", value: 5000, type: "decrease"},
    {date: "11/08/2020", value: 25000, type: "increase"},
    {date: "05/09/2020", value: 20000, type: "increase"},
    {date: "15/10/2020", value: 7500, type: "decrease"}
  ]
});

// money list selector
export interface MoneyList {
  date: string;
  value: Money[];
}
const moneyList = selector({
  key: 'moneyListSelector',
  get: ({get}) => {
    const value = get(money);
    let newVal: MoneyList[] = [];

    // process money into nested form
    // maintain into map using date as key
    // only month and year
    let rawVal: Map<string, Money[]> = new Map();
    for(let val of value) {
      const rawDate = val.date.split("/");
      const dateTemp = `${rawDate[1]}/${rawDate[2]}`;
      let prev = rawVal.get(dateTemp);
      if(!prev) prev = [];
      rawVal.set(dateTemp, [...prev, val])
    }

    // convert map into array
    // and sort using date
    rawVal.forEach((value, key) => {
      newVal.push({
        date: key,
        value: value.sort((a, b) => b.date.localeCompare(a.date))
      });
    })
    newVal.sort((a, b) => {
      const rawA = a.date.split("/");
      const rawB = b.date.split("/");
      if(rawA[1] !== rawB[1]){
        return parseInt(rawB[1]) - parseInt(rawA[1]);
      }else{
        return parseInt(rawB[0]) - parseInt(rawA[0]);
      };
    });

    return newVal;
  }
})

const moneyOverall = selector({
  key: 'moneyOverallSelector',
  get: ({get}) => {
    const value = get(money);
    let newVal: MoneyList[] = [];

    // process money into nested form
    // maintain into map using date as key
    let rawVal: Map<string, Money[]> = new Map();
    for(let val of value) {
      let prev = rawVal.get(val.date);
      if(!prev) prev = [];
      rawVal.set(val.date, [...prev, val])
    }

    // convert map into array
    // and sort using date
    rawVal.forEach((value, key) => {
      newVal.push({
        date: key,
        value: value
      });
    })
    newVal.sort((a, b) => b.date.localeCompare(a.date));

    let newValue: Money[] = newVal.map(value => {
      return value.value.reduce((prev, cur) => {
        const tempPrev = prev.type === 'increase' ? prev.value : -prev.value;
        const tempCur = cur.type === 'increase' ? cur.value : -cur.value;
        const res = tempPrev + tempCur;

        return {
          date: prev.date,
          value: Math.abs(res),
          type: res >= 0 ? 'increase' : 'decrease'
        };
      });
    })

    return newValue;
  }
})

const income = selector({
  key: 'incomeSelector',
  get: ({get}) => {
    const value = get(moneyOverall);
    const reduced = value.reduce((prev, cur) => {
      const tempPrev = prev.type === 'increase' ? prev.value : -prev.value;
      const tempCur = cur.type === 'increase' ? cur.value : -cur.value;
      const res = tempPrev + tempCur;

      return {
        date: prev.date,
        value: Math.abs(res),
        type: res >= 0 ? 'increase' : 'decrease'
      };
    });

    return reduced.type === "increase" ? reduced.value : 0 ;
  }
})

// getter and setter
export const getMoneyList = () => {
  return useRecoilValue(moneyList);
}

export const setMoneyList = () => {
  const setMoney = useSetRecoilState(money);
  return (value: Money) => {
    setMoney((val) => [...val, value]);
  }
}

export const getMoneyOverall = () => {
  return useRecoilValue(moneyOverall);
}

export const getIncome = () => {
  return useRecoilValue(income);
}