export default function Avatar({ person, size = 30 }) {
  const style = { width: size, height: size, background: person.photo ? 'transparent' : person.color };
  return (
    <span className="avatar" style={style}>
      {person.photo ? <img src={person.photo} alt={person.name} /> : (person.name?.[0] || '?')}
    </span>
  );
}
