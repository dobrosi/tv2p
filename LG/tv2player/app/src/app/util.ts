export function log(msg: string) {
  console.log(msg)
  document.getElementById("logger")!.innerHTML = msg
}
