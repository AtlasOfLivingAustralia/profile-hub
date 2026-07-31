import { type Collection } from "#/api/types";
import { useLoaderData } from "react-router";

function Home() {
  const collections = useLoaderData<Collection[]>();

  return (
    <>
      <h2>Profile Collections</h2>
      <h3>Profile Collections</h3>
      {collections.map((collection) => (
        <div key={collection.uuid}>{collection.shortName}</div>
      ))}
    </>
  );
}

export default Home;
