import mongoose from 'mongoose'

const reviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 1,
    },
    review: {
        type: String,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
})

const Review = mongoose.model('Review', reviewSchema)

export default Review