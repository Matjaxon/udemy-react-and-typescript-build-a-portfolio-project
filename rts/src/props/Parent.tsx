import { ChildAsFC } from './Child';

const Parent = () => {
  return (
    <ChildAsFC color="red" onClick={() => console.log('clicked')}>
      aljlkj
    </ChildAsFC>
  );
};

export default Parent;
