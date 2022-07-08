import Joi from "joi";

// O tipo do cartão só deve ser uma das seguintes opções:(??)

export const typeCardSchema = Joi.object({
    employeeId: Joi.number().required(),
    cardType: Joi.equal(
        "groceries",
        "restaurant",
        "transport",
        "education",
        "health"
    )
})