export default function addComma(num) {
  return num
    .toString()
    .split("")
    .reverse()
    .map((value, index) => (index % 3 === 0 && index !== 0 ? value + "," : value))
    .reverse()
    .join("");
}
