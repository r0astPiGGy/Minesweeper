function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let swapIndex = Math.floor(Math.random() * (i + 1));

        let temp = array[i];
        array[i] = array[swapIndex];
        array[swapIndex] = temp
    }
    return array
}

function uniqueArray(size) {
    return shuffle(Array.from({ length: size }, (v, i) => i))
}

function pointOf(x, y) {
    return {
        x: +x,
        y: +y
    }
}

function packPoint(width, x, y) {
    return (y * width) + x
}

function destructPoint(width, packedPoint) {
    return {
        x: packedPoint % width,
        y: Math.floor(packedPoint / width)
    }
}