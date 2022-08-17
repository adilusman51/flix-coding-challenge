export type User = {
	readonly name: string;
	readonly age: number;
};

export class ApiClient {
	private static readonly users: User[] = [
		{
			name: 'Matthew',
			age: 20,
		},
		{
			name: 'Alexander',
			age: 25,
		},
		{
			name: 'Samuel',
			age: 22,
		},
	];

	public static async fetchUsers(): Promise<User[]> {
		return Promise.resolve(ApiClient.users);
	}
}
