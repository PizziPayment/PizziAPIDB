import { assignNonNullValues } from '../../../../src/commons/services/util.service'

describe('assignNonNullValues', () => {
  it("shouldn't not assign null or undefined value", () => {
    const obj: Object = { null: null, undefined: undefined, number: 1, string: 'string' }

    const new_obj = assignNonNullValues(obj)

    expect(new_obj.null).toBeUndefined()
    expect(new_obj.undefined).toBeUndefined()
    expect(new_obj.number).toBe(1)
    expect(new_obj.string).toBe('string')
  })
})
