export async function $beforeAllTests(){
    console.log("Before all tests")
}

export async function $afterAllTests(){
    console.log("After all tests")
}

export async function $beforeEachTest(name, fnPtr) {
    console.log("Before test " + name)
}

export async function $afterEachTest(name, fnPtr) {
    console.log("After test " + name)
}

export function okFunction() {
}

export function errFunction() {
    throw new Error("errFunction Error");
}

export async function asyncOkFunction() {
}

export async function asyncErrFunction() {
    throw new Error("errFunction Error");
}

function notTestableFunction() {
    throw new Error("This error should not appear");
}

function asyncNotTestableFunction() {
    throw new Error("This error should not appear");
}