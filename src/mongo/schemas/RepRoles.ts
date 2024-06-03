import { Schema, model as createModel } from "mongoose";

export interface IRepRoles {
    guildId: string;
    roleId: string;
    rep: number;
}

const schema = new Schema<IRepRoles>({
    guildId: { type: String, required: true, unique: false },
    roleId: { type: String, required: true, unique: true },
    rep: { type: Number, required: true, unique: false }
});

export const RepRoles = createModel<IRepRoles>("RepRoles", schema);