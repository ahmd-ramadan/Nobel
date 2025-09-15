export const ValidationErrorMessages = {
    // User validation errors
    INVALID_ADMIN_ID: 'Invalid admin ID format',
    INVALID_USERNAME: 'Username must be 3-20 characters and can only contain lowercase letters, numbers, underscores, and hyphens',
    INVALID_PASSWORD: 'Password: 8+ chars, 1 number, 1 special, 1 lowercase or uppercase',
    INVALID_NAME: 'Name must be at least 3 characters',
    INVALID_PHONE: 'Invalid Egyptian phone number format',
    MODEL_EXIST: "This model name is exist can't add two models with two names",

    // User service errors
    USER_NOT_FOUND: 'User not found',
    USERNAME_UPDATE_NOT_ALLOWED: 'Username update is not allowed',
    USERNAME_ALREADY_EXISTS: 'Username already exists',
    INCORRECT_OLD_PASSWORD: 'Incorrect old password',
    USER_ALREADY_EXISTS: 'User already exists',
    USER_NOT_BLOCKED: 'User is not blocked',
    USER_IS_BLOCKED: 'You are blocked by admin. You cannot access the system',

    // Auth service errors
    INVALID_CREDENTIALS: 'Invalid username or password',
    UNAUTHORIZED_ACCESS: 'Unauthorized access',
    LOGIN_FAILED: 'Login failed',
    LOGOUT_FAILED: 'Logout failed',

    // Success messages
    USER_PROFILE_RETRIEVED: 'User profile retrieved successfully',
    USER_PROFILE_UPDATED: 'User profile updated successfully',
    PASSWORD_UPDATED: 'Password updated successfully',
    USER_CREATED: 'User account created successfully',
    USER_UPDATED: 'User data updated successfully',
    USER_DELETED: 'User account deleted successfully',
    USER_BLOCKED: 'User account blocked successfully',
    USER_UNBLOCKED: 'User account unblocked successfully',
    USERS_RETRIEVED: 'All users retrieved successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    GET_ALL_TRACKS_SUCCESS: 'All tracks history retrieved successfully',
    
    // Internal server errors
    CREATE_USER_FAILED: 'Failed to create new user account',
    UPDATE_USER_FAILED: 'Failed to update user data',
    GET_USERS_FAILED: 'Failed to retrieve users',
    DELETE_USER_FAILED: 'Failed to delete user account',
    BLOCK_USER_FAILED: 'Failed to block user account',
    ADD_TRACKING_FAILED: 'Add new tracking failed',
    GET_ALL_TRACKING_FAILED: "Get all tracking failed",
    UPDATE_MODEL_FAILED: "Update model failed",
    ADD_MODEL_FAILED: "Add model failed",
    ADD_MODEL_FAILED2: "Another model in process adding, wait some time",
    DELETE_MODEL_FAILED: "Delete model failed",
    GET_ALL_MODEL_FAILED: "Get all models failed",
} as const;

// Original Arabic messages for reference
export const ArabicErrorMessages = {
    // Validation errors
    INVALID_ADMIN_ID: 'مَعرف الادمن غير صحيح',
    INVALID_USERNAME: 'يجب أن يكون اسم المستخدم من 3 إلى 20 حرفًا ويحتوي فقط على أحرف صغيرة وأرقام وشرطات سفلية وشرطات',
    INVALID_PASSWORD: 'كلمة المرور: 8+ أحرف، رقم واحد، حرف خاص واحد، حرف صغير أو كبير واحد',
    INVALID_NAME: 'يجب أن يكون الاسم 3 أحرف على الأقل',
    INVALID_PHONE: 'صيغة رقم الهاتف المصري غير صالحة',
    MODEL_EXIST: "إسم الموديل موجود لا يمكنك تسميته مرة أخري",

    // User service errors
    USER_NOT_FOUND: 'هذا المستخدم غير موجود',
    USERNAME_UPDATE_NOT_ALLOWED: 'لا يمكنك تحديث ال username الخاص بك',
    USERNAME_ALREADY_EXISTS: 'اسم المستخدم موجود بالفعل .. لا يمكن تكراره',
    INCORRECT_OLD_PASSWORD: 'كلمة المرور القديمة غير صحيحة',
    USER_ALREADY_EXISTS: 'المستخدم موجود بالفعل',
    USER_NOT_BLOCKED: 'المستخدم ليس محظورا من الاساس',
    USER_IS_BLOCKED: 'انت محظور من قبل الأدمن .. لايمكنك الدخول لللسيستم',

    // Auth service errors
    INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    UNAUTHORIZED_ACCESS: 'غير مَصرح لك',
    LOGIN_FAILED: 'فشل عملية تسجيل الدخول',
    LOGOUT_FAILED: 'فشل عملية تسجيل الخروج',

    // Success messages
    USER_PROFILE_RETRIEVED: 'تم إرجاع بيانات المستخدم بنجاح',
    USER_PROFILE_UPDATED: 'تم تحديث بيانات المستخدم بنجاح',
    PASSWORD_UPDATED: 'تم تحديث كلمة المرور بنجاح',
    USER_CREATED: 'تم إنشاء حساب المستخدم بنجاح',
    USER_UPDATED: 'تم تحديث بيانات المستخدم بنجاح',
    USER_DELETED: 'تم حذف الحساب بنجاج',
    USER_BLOCKED: 'تم تقييد الحساب بنجاج',
    USER_UNBLOCKED: 'تم إلغاء تقييد الحساب بنجاح',
    USERS_RETRIEVED: 'تم إرجاع كل المستخدمين بنجاح',
    LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
    LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح',
    GET_ALL_TRACKS_SUCCESS: 'تم إرجاع كل سجل التتبع بنجاح',

    // Internal server errors
    CREATE_USER_FAILED: 'فشل عملية إنشاء حساب مستخدم جديد',
    UPDATE_USER_FAILED: 'فشل عملية تحديث بيانات المستخدم',
    GET_USERS_FAILED: 'فشل عملية إرجاع المستخدمين',
    DELETE_USER_FAILED: 'فشل عملية حذف الحساب',
    BLOCK_USER_FAILED: 'فشل عملية حذف الحساب',
    ADD_TRACKING_FAILED: 'فشل عملية إضافة عملية تتبع جديدة',
    GET_ALL_TRACKING_FAILED: "فشل عملية استرجاع بيانات التتبع",
    UPDATE_MODEL_FAILED: "فشل عمليىة تحديث الموديل",
    ADD_MODEL_FAILED: "فشلت عملية إضافة الموديل",
    DELETE_MODEL_FAILED: "فشلت عملية حذف الموديل ",
    GET_ALL_MODEL_FAILED: "فشل عملية إسترجاع الموديلات",
} as const; 