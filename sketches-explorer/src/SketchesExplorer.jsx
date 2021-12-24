import tree from "./tree.json";
import { map } from "lodash";

const SketchesExplorer = () => {
  return (
    <div>
      <h2>
        Sketches explorer{" "}
        <a href="https://www.twitter.com/BlousonRouge" target="_blank">
          @BlousonRouge
        </a>
      </h2>
      <ul>
        {map(tree, (sketches, sketchTheme) => (
          <li key={sketchTheme}>
            <h3>{sketchTheme}</h3>
            <ul>
              {map(sketches, ({ name, _path }) => (
                <li key={name}>
                  <a href={`${import.meta.env.BASE_URL}${name}`}>{name}</a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SketchesExplorer;
