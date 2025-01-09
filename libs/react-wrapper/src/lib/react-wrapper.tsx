import styles from './react-wrapper.module.scss';

export function ReactWrapper() {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ReactWrapper!</h1>
    </div>
  );
}

export default ReactWrapper;
