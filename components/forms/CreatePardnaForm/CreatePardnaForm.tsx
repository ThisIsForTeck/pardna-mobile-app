import { useState } from "react";
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { FieldArray, Formik } from "formik";
import * as Yup from "yup";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker, { Event } from "@react-native-community/datetimepicker";
import CurrencyInput from "react-native-currency-input";
import { useMutation } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { CREATE_PARDNA_MUTATION, PARDNAS_QUERY } from "../../../apollo/queries";
import tw from "../../../lib/tailwind";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSpinnerThird } from "@fortawesome/pro-regular-svg-icons";

const CreatePardnaSchema = Yup.object().shape({
  name: Yup.string(),
  participants: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
    }),
  ),
  startDate: Yup.date().required(),
  duration: Yup.number().required(),
  contributionAmount: Yup.number().required(),
  bankerFee: Yup.number().required(),
  paymentFrequency: Yup.string().required(),
});

const CreatePardnaForm = () => {
  const [createPardna] = useMutation(CREATE_PARDNA_MUTATION, {
    refetchQueries: [PARDNAS_QUERY],
  });
  const [paymentFrequencyOpen, setPaymentFrequencyOpen] = useState(false);
  const [paymentFrequencies, setPaymentFrequencies] = useState([
    { label: "Daily", value: "DAILY" },
    { label: "Weekly", value: "WEEKLY" },
    { label: "Monthly", value: "MONTHLY" },
  ]);
  const navigation = useNavigation();

  return (
    <Formik
      initialValues={{
        name: "",
        startDate: new Date(),
        duration: 12,
        bankerFee: 10,
        contributionAmount: 10,
        paymentFrequency: "MONTHLY",
        participants: [],
      }}
      validationSchema={CreatePardnaSchema}
      onSubmit={async (
        {
          name,
          startDate,
          duration,
          contributionAmount,
          bankerFee,
          paymentFrequency,
          participants,
        },
        { resetForm },
      ) => {
        try {
          const {
            data: {
              createPardna: { id },
            },
          } = await createPardna({
            variables: {
              name,
              startDate,
              duration,
              contributionAmount: contributionAmount * 100,
              bankerFee,
              paymentFrequency,
              participants,
            },
          });

          resetForm();

          navigation.navigate("Pardna", {
            id,
          });
        } catch (e) {
          console.error({ e });
        }
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        setFieldValue,
        isSubmitting,
      }) => {
        const getDurationSuffix = () => {
          let prefix;

          switch (values.paymentFrequency) {
            case "DAILY":
              prefix = " days";
              break;
            case "WEEKLY":
              prefix = " weeks";
              break;
            case "MONTHLY":
              prefix = " months";
              break;
            default:
              prefix = " months";
              break;
          }

          return prefix;
        };

        const durationSuffix = getDurationSuffix();

        return (
          <View style={tw`h-full`}>
            <View>
              <Text style={tw`text-sm font-medium text-gray-700`}>Name</Text>
              <View style={tw`mt-2`}>
                <TextInput
                  style={tw`
                  w-full px-6 py-4 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={values.name}
                  placeholder="Name"
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View
              style={[
                tw`mt-4`,
                Platform.OS !== "android" && { zIndex: 999999 },
              ]}
            >
              <Text style={tw`text-sm font-medium text-gray-700`}>
                Payment frequency
              </Text>
              <View style={tw`mt-2`}>
                <DropDownPicker
                  placeholder="Select Payment frequency"
                  showTickIcon={false}
                  open={paymentFrequencyOpen}
                  value={values.paymentFrequency}
                  items={paymentFrequencies}
                  setOpen={setPaymentFrequencyOpen}
                  setValue={(state) => {
                    let newState = state;

                    if (typeof state === "function") {
                      newState = state(values.paymentFrequency);
                    }

                    setFieldValue("paymentFrequency", newState);
                  }}
                  setItems={setPaymentFrequencies}
                  style={tw`w-full px-6 py-4 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm `}
                  dropDownContainerStyle={{
                    borderColor: tw.color("gray-300"),
                  }}
                />
              </View>
            </View>
            <View style={tw`mt-4`}>
              <Text style={tw`text-sm font-medium text-gray-700`}>
                Start Date
              </Text>
              <View style={tw`mt-2`}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={values.startDate}
                  onChange={(event: Event, date: Date | undefined) =>
                    setFieldValue("startDate", date)
                  }
                />
              </View>
            </View>
            <View style={tw`mt-4`}>
              <Text style={tw`text-sm font-medium text-gray-700`}>
                Duration
              </Text>
              <View style={tw`mt-2`}>
                <CurrencyInput
                  style={tw`w-full px-6 py-4 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={values.duration}
                  suffix={durationSuffix}
                  separator="."
                  delimiter=","
                  precision={0}
                  minValue={0}
                  maxValue={52}
                  onChangeValue={(value: number | null) =>
                    setFieldValue("duration", value)
                  }
                />
              </View>
            </View>
            <View style={tw`mt-4`}>
              <Text style={tw`text-sm font-medium text-gray-700`}>
                Contribution amount
              </Text>
              <View style={tw`mt-2`}>
                <CurrencyInput
                  style={tw`w-full px-6 py-4 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={values.contributionAmount}
                  prefix="£"
                  separator="."
                  delimiter=","
                  precision={2}
                  minValue={0}
                  onChangeValue={(value: number | null) =>
                    setFieldValue("contributionAmount", value)
                  }
                />
              </View>
            </View>
            <View style={tw`mt-4`}>
              <Text style={tw`text-sm font-medium text-gray-700`}>
                Banker fee per contribution (£
                {values.contributionAmount * (values.bankerFee / 100)})
              </Text>
              <View style={tw`mt-2`}>
                <CurrencyInput
                  style={tw`w-full px-6 py-4 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={values.bankerFee}
                  suffix=" %"
                  separator="."
                  delimiter=","
                  precision={2}
                  minValue={0}
                  maxValue={40}
                  onChangeValue={(value: number | null) =>
                    setFieldValue("bankerFee", value)
                  }
                />
              </View>
            </View>
            <View style={tw`mt-4`}>
              <Text style={tw`text-sm font-medium text-gray-700`}>
                Participants
              </Text>
              <View style={tw`mt-2`}>
                <FieldArray
                  name="participants"
                  render={(arrayHelpers) => (
                    <View>
                      {values.participants.length > 0 ? (
                        values.participants.map((participant, index) => (
                          <View key={index} style={tw`mb-8`}>
                            <TextInput
                              style={tw`
                  w-full px-6 py-4 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-4`}
                              value={values.participants[index].name}
                              placeholder="Name"
                              onChangeText={handleChange(
                                `participants[${index}].name`,
                              )}
                              onBlur={handleBlur(`participants[${index}].name`)}
                              autoCapitalize="none"
                            />
                            <TextInput
                              style={tw`
                  w-full px-6 py-4 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              value={values.participants[index].email}
                              placeholder="Email"
                              onChangeText={handleChange(
                                `participants[${index}].email`,
                              )}
                              onBlur={handleBlur(
                                `participants[${index}].email`,
                              )}
                              autoCapitalize="none"
                            />
                            <View style={tw`flex-row`}>
                              <TouchableOpacity
                                style={tw`mt-8 mr-4 flex flex-1 justify-center py-4 px-8 border border-red-600 rounded-md shadow-sm  hover:bg-red-700"`}
                                onPress={() => arrayHelpers.remove(index)}
                              >
                                <Text
                                  style={tw`text-sm font-medium text-red-600 text-center`}
                                >
                                  -
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={tw`mt-8 flex flex-1 justify-center py-4 px-8 border border-transparent rounded-md shadow-sm bg-green-600 hover:bg-green-700"`}
                                onPress={() =>
                                  arrayHelpers.insert(index + 1, {
                                    name: "",
                                    email: "",
                                  })
                                }
                              >
                                <Text
                                  style={tw`text-sm font-medium text-white text-center`}
                                >
                                  +
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))
                      ) : (
                        <TouchableOpacity
                          style={tw`mt-8 w-full flex justify-center py-4 px-8 border border-transparent rounded-md shadow-sm bg-green-600 hover:bg-indigo-700"`}
                          onPress={() => arrayHelpers.push("")}
                        >
                          {/* show this when user has removed all friends from the list */}
                          <Text
                            style={tw`text-sm font-medium text-white text-center`}
                          >
                            Add a participant
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>
            <TouchableOpacity
              style={tw`flex flex-row items-center mt-8 w-full flex justify-center py-4 px-8 border border-transparent rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700",
            `}
              onPress={() => handleSubmit()}
            >
              <Text style={tw`text-sm font-medium text-white`}>
                {isSubmitting ? "Creating" : "Create"}
              </Text>
              {isSubmitting ? (
                <FontAwesomeIcon
                  icon={faSpinnerThird}
                  size={20}
                  style={tw`ml-2 text-white`}
                />
              ) : null}
            </TouchableOpacity>
          </View>
        );
      }}
    </Formik>
  );
};

export default CreatePardnaForm;
