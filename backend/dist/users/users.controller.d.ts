import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        error: string;
        id?: undefined;
        email?: undefined;
        isPaid?: undefined;
    } | {
        id: import("mongoose").Types.ObjectId;
        email: string;
        isPaid: boolean;
        error?: undefined;
    }>;
    getProtectedData(req: any): Promise<{
        error: string;
        message?: undefined;
        data?: undefined;
    } | {
        message: string;
        data: string;
        error?: undefined;
    }>;
}
