export const BaseSchema = {
    createdOn: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    }
}