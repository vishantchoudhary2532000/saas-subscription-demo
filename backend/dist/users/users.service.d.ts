import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(email: string, password: string): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    markAsPaid(userId: string, customerId: string, subscriptionId: string): Promise<UserDocument | null>;
    validatePassword(password: string, hashedPassword: string): Promise<boolean>;
}
