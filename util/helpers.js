exports.getOffsetIncrement = (locationStudentCount) => {
    let standardDegreesIncrement = 4
    let increment =
        standardDegreesIncrement * (Math.floor(locationStudentCount / 8) + 1)
    let direction = locationStudentCount % 8
    let offset = []
    switch (direction) {
        case 1:
            offset = [0, increment]
            break
        case 2:
            offset = [increment, increment]
            break
        case 3:
            offset = [increment, 0]
            break
        case 4:
            offset = [increment, -increment]
            break
        case 5:
            offset = [0, -increment]
            break
        case 6:
            offset = [-increment, -increment]
            break
        case 7:
            offset = [-increment, 0]
            break
        case 0:
            offset = [-increment, increment]
            break
    }
    return {
        x: offset[0],
        y: offset[1],
    }
}

exports.addUpOffsets = (coordinates, offset) => {
    return [
        coordinates[0] + offset[0] / 10 ** 4,
        coordinates[1] + offset[1] / 10 ** 4,
    ]
}
