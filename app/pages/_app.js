import '../GlobalStyles.scss'; // Import your global styles
import DefaultLayouts from './DefaultLayouts/Header/page'; // Adjust the path as necessary

function App({ Component, pageProps }) {
  return (
    <DefaultLayouts>
      <Component {...pageProps} />
    </DefaultLayouts>
  );
}

export default App;
