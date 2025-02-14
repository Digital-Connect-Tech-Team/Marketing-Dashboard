import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface UserSelectProps {
  users: { name: string }[];
  loading: boolean;
  error: string | null;
  selected: string;
  onChange: (value: string) => void;
}

export default function UserSelect({
  users,
  loading,
  error,
  selected,
  onChange
}: UserSelectProps) {
  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder='Select Sale Person' />
      </SelectTrigger>
      <SelectContent className='max-h-60 overflow-auto'>
        <SelectGroup>
          {loading ? (
            <SelectItem disabled value='loading'>
              Loading...
            </SelectItem>
          ) : error ? (
            <SelectItem disabled value='error'>
              {error}
            </SelectItem>
          ) : users.length > 0 ? (
            users.map((user, i) => (
              <SelectItem key={i} value={user.name}>
                {user.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled value='no-data'>
              No Users Found
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
