import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  first_name: string;
  email: string;
}

const fetchUsers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('users') // Replace with your actual table name
    .select('id, first_name, email')
    .order('first_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export default function UsersList() {
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['users-list'],
    queryFn: fetchUsers,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500 animate-pulse">Loading users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
        <h3 className="font-semibold">Failed to load users</h3>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No users found in the database.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User Profiles</h2>
      
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">{user.first_name || 'No Name'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
