const isEmpty = (string) => {
    if (string.trim() === '') return true
    else return false
}

exports.validateNewStudentData = (data, edit = false) => {
    let errors = {}

    if (!('name' in data) || isEmpty(data.name))
        errors.name = 'Must not be empty!'
    if (!('surname' in data) || isEmpty(data.surname))
        errors.surname = 'Must not be empty!'
    if (!('graduated' in data) || isEmpty(data.graduated))
        errors.graduated = 'Must not be empty!'
    if (!('description' in data) || isEmpty(data.description))
        errors.description = 'Must not be empty!'

    if ('location' in data) {
        if (!('title' in data.location) || isEmpty(data.location.title))
            errors.location.title = 'Must not be empty!'
        if (
            !('coordinates' in data.location) ||
            data.location.coordinates.length != 2
        )
            errors.location.coordinates = 'Location coordinates invalid!'
        if (!('type' in data.location) && isEmpty(data.location.type))
            errors.location.type = 'Must not be empty!'
    } else {
        errors.location = 'Location details are required!'
    }

    if (edit && !('studentId' in data))
        errors.studentId = 'Student ID is required for this action!'

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    }
}
