<template>
  <div class="form-group d-flex">
    <label
      for="city"
      class="mr-2 col-form-label text-right"
    >{{label}}</label>
    <div class="flex-fill">
      <select
        id="city"
        class="form-control"
        :value="value"
        @input="$_onInput($event)"
      >
        <option
          disabled
          value=""
        >-- 選擇縣市 --</option>
        <option
          v-for="(item,index) in optionList"
          :key="index"
          :value="item[textKey]"
        >
          {{ item[textKey] }}
        </option>
      </select>
    </div>
  </div>
</template>
<script>
export default {
  name: "BelongsToSelect",
  methods: {
    $_onInput($event) {
      this.$emit("input", $event.target.value);
    },
  },
  props: {
    optionList: {
      type: Array,
    },
    textKey: {
      type: String,
    },
    value: {
      type: [String, Number],
    },
    label: {
      type: String,
      default: "",
    },
  },
};
</script>
<style lang="scss">
</style>