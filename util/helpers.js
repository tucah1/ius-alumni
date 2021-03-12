exports.randomDirection = (coordinates) => {
    return new Promise((resolve, reject) => {
        try {
            let iterations = Math.round(Math.random() * 50) + 1
            while (iterations > 0) {
                let direction = Math.round(Math.random() * 4) + 1
                switch (direction) {
                    case 1:
                        coordinates[0] +=
                            (Math.round(Math.random() * 9) + 1) / 10 ** 4
                        break
                    case 2:
                        coordinates[0] -=
                            (Math.round(Math.random() * 9) + 1) / 10 ** 4
                        break
                    case 3:
                        coordinates[1] +=
                            (Math.round(Math.random() * 9) + 1) / 10 ** 4
                        break
                    case 4:
                        coordinates[1] -=
                            (Math.round(Math.random() * 9) + 1) / 10 ** 4
                        break
                }
                iterations -= 1
            }
            resolve(coordinates.map((x) => x.toFixed(5)))
        } catch (e) {
            reject(e)
        }
    })
}
