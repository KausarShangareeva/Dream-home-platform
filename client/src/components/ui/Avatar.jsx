export default function Avatar({ person, size = 30 }) {
  const boxStyle = person.photo
    ? { width: size, height: size, padding: 0, overflow: 'hidden', background: person.color }
    : { width: size, height: size, background: person.color };

  return (
    <span className="avatar" style={boxStyle}>
      {person.photo
        ? <img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : (person.name?.[0] || '?')}
    </span>
  );
}
