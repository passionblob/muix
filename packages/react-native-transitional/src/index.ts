import TransitionalView from "./transitional.view"
import TransitionalText from "./transitional.text"
import TransitionalImage from "./transitional.image"
import TransitionalFlatList from "./transitional.flatlist"
import TransitionalSectionList from "./transitional.sectionlist"
import TransitionalScrollView from "./transitional.scrollview"
import TransitionalTextInput from "./transitional.textinput"

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