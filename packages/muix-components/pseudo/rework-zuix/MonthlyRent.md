# 드는 생각들
1. 월세납부화면 제작하는 것만 생각했을 때 유효한지?
2. 패딩이나 마진, 글자크기 같은 스타일 관련 오브젝트를 신경쓰지 않도록 하는 게 목적인 것 같다.

```js
//InfoTextList
interface InfoTextListProps {
    items: {
        iconSrc: zType.imageSourceType
        title: string
        subtitle: string
    }[]
}

//AgreementItem
interface AgreementItemProps {
    title: string
    subtitle?: string
    selected: boolean
    disabled?: boolean
    onPress: () => void | Promise<void>
    rightButton?: {
		text: string
		onPress: () => void | Promise<void>
	}
}

//CardRegisterItem | 우리집 내놓기에도  쓰임
interface CardRegisterItemProps {
    iconSrc: zType.imageSourceType
    title: string
    subtitle?: string
    infoText?: {
        iconSrc?: string
        text: string | zType.textBoldTypeOptions
    }
    onPress: () => zType.functionType
    status?: "disabled" | "normal" | "add" // add 일때는 arrow이미지나와야함
}

//CardItem
interface CardItemProps {
    iconSrc: zType.imageSourceType
    title: string
    subtitle?: string
    onPress: () => zType.functionType
    rightButton?: {
		iconSrc: zType.imageSourceType
		onPress: () => zType.functionType
	}
}

//PaymentStatusItem
interface PaymentStatusItemProps {
    subtext1: string
    subtext2: string
    status: "start" | "check" | "success" | "fail" //start(작성중)일때 삭제 버튼 추가 되어야함
    statusText: string
    title: string
    onDeletePress?: () => zType.functionType
    info?: {
        button?: {
            text: string
            onPress: () => zType.functionType
        }
        text?: string | { value: string, color?: Color }[]
    }
}

//DescriptionList
interface DescriptionListProps {
    items: {
        title: string
        description: string
    }[]
    ratio?: [number, number]
    fill?: boolean // true : 회색, false : 투평
}

//TabE
interface Tabs {
    items: string[]
    onPress: (result: TabsSelectedItemProps) => zType.functionType
}

interface TabsSelectedItemProps {
	item: string
	index: number
	array: TabsSelectedItemProps[]
}

//FinanceList
interface FinanceListProps {
    items: FinanceListItem[]
    onPress: (result: FinanceItemSelectedProps) => zType.functionType
}

interface FinanceListItem {
    iconSrc: zType.imageSourceType
    name: string
    disabledText?: string
}

interface FinanceItemSelectedProps {
    item: FinanceListItem
	index: number
	array: FinanceItemSelectedProps[]
}

//FileUploadBox
interface FileUploadBoxProps {
    //이미지 관련 된 것은 ImageUploader prop 참고하셔서 필요한 것들 넣어주세요 
    infoText: zType.textBoldTypeOptions
}
```