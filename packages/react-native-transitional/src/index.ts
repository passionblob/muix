import TransitionalView from "./components/transitional.view"
import TransitionalText from "./components/transitional.text"
import TransitionalImage from "./components/transitional.image"
import TransitionalFlatList from "./components/transitional.flatlist"
import TransitionalSectionList from "./components/transitional.sectionlist"
import TransitionalScrollView from "./components/transitional.scrollview"
import TransitionalTextInput from "./components/transitional.textinput"

export class Transitional {
  static Text = TransitionalText
  static View = TransitionalView
  static Image = TransitionalImage
  static FlatList = TransitionalFlatList
  static SectionList = TransitionalSectionList
  static ScrollView = TransitionalScrollView
  static TextInput = TransitionalTextInput
}

export default Transitional