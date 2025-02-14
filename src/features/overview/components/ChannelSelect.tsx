import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ChannelSelectProps {
  type: 'main' | 'sub';
  channels: { name: string }[];
  loading: boolean;
  error: string | null;
  selected: string;
  onChange: (value: string) => void;
}

export default function ChannelSelect({
  type,
  channels,
  loading,
  error,
  selected,
  onChange
}: ChannelSelectProps) {
  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className='w-full'>
        <SelectValue
          placeholder={`Select ${type === 'main' ? 'Main' : 'Sub'} channel`}
        />
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
          ) : channels.length > 0 ? (
            channels.map((ch, i) => (
              <SelectItem key={i} value={ch.name}>
                {ch.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled value='no-data'>
              No {type} channel Found
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
