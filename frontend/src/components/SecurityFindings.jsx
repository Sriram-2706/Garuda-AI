import FindingsSection from './FindingsSection'

function SecurityFindings({ findings }) {
  return (
    <FindingsSection
      title="Security Intelligence"
      findings={findings}
      emptyMessage="No security intelligence is available for this repository."
      emptyFilteredMessage="No security findings match the current search and filter settings."
    />
  )
}

export default SecurityFindings
