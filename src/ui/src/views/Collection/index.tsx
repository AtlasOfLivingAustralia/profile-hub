import Container from "react-bootstrap/Container";
import { useParams } from "react-router";

export function Component() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <Container className="py-5">
      Collections page! ({slug})
    </Container>
  );
}
